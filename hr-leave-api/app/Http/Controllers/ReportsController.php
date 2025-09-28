<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\LeaveHistoryExport;
use App\Exports\LeaveStatisticsExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Log;

class ReportsController extends Controller
{
    public function exportReports(Request $request)
    {
        Log::info('Export request received: ', $request->all());
        $request->validate([
            'report_type' => 'required|in:leave_history,statistics',
            'format' => 'required|in:pdf,excel,csv',
            'date_range' => 'required|in:last_week,last_month,last_quarter,last_year,custom',
            'custom_start_date' => 'nullable|date|required_if:date_range,custom',
            'custom_end_date' => 'nullable|date|required_if:date_range,custom|after_or_equal:custom_start_date',
            'include_fields' => 'nullable|array',
            'filters' => 'nullable|array'
        ]);

        // Get date range
        $dateRange = $this->getDateRange($request->date_range, $request->custom_start_date, $request->custom_end_date);
        // Build query based on report type
        $data = $this->buildQuery($request->report_type, $dateRange, $request->filters ?? []);
        Log::info('Data: ', (array)$data);
        // Generate filename
        $filename = $this->generateFilename($request->report_type, $request->format);

        try {
            switch ($request->format) {
                case 'pdf':
                    return $this->exportToPdf($data, $request->report_type, $request->include_fields ?? [], $filename);
                
                case 'excel':
                    return $this->exportToExcel($data, $request->report_type, $request->include_fields ?? [], $filename);
                
                case 'csv':
                    return $this->exportToCsv($data, $request->report_type, $request->include_fields ?? [], $filename);
                
                default:
                    return response()->json(['error' => 'Invalid format'], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Export failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get date range based on selection
     */
    private function getDateRange($range, $customStart = null, $customEnd = null)
    {
        $now = now();
        
        switch ($range) {
            case 'last_week':
                return [
                    'start' => $now->copy()->subWeek()->startOfWeek(),
                    'end' => $now->copy()->subWeek()->endOfWeek()
                ];
            
            case 'last_month':
                return [
                    'start' => $now->copy()->subMonth()->startOfMonth(),
                    'end' => $now->copy()->subMonth()->endOfMonth()
                ];
            
            case 'last_quarter':
                return [
                    'start' => $now->copy()->subQuarter()->startOfQuarter(),
                    'end' => $now->copy()->subQuarter()->endOfQuarter()
                ];
            
            case 'last_year':
                return [
                    'start' => $now->copy()->subYear()->startOfYear(),
                    'end' => $now->copy()->subYear()->endOfYear()
                ];
            
            case 'custom':
                return [
                    'start' => Carbon::parse($customStart)->startOfDay(),
                    'end' => Carbon::parse($customEnd)->endOfDay()
                ];
            
            default:
                return [
                    'start' => $now->copy()->subMonth()->startOfMonth(),
                    'end' => $now->copy()->subMonth()->endOfMonth()
                ];
        }
    }

    /**
     * Build query based on report type and filters
     */
    private function buildQuery($reportType, $dateRange, $filters)
    {
        if ($reportType === 'leave_history') {
            $query = LeaveRequest::with(['user.department', 'leaveType'])
                ->whereBetween('start_date', [$dateRange['start'], $dateRange['end']]);
            
            // Apply filters
            if (!empty($filters['status']) && $filters['status'] !== 'all') {
                $query->where('status', $filters['status']);
            }
            
            if (!empty($filters['leave_type']) && $filters['leave_type'] !== 'all') {
                $query->where('leave_type_id', $filters['leave_type']);
            }
            
            return $query->orderBy('start_date', 'desc')->get();
        }
        
        // For statistics, return processed data
        return $this->getStatisticsData($dateRange, $filters);
    }

    /**
     * Get statistics data with filters
     */
    private function getStatisticsData($dateRange, $filters)
    {
        $query = LeaveRequest::whereBetween('start_date', [$dateRange['start'], $dateRange['end']]);
        
        // Apply filters to statistics
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }
        
        if (!empty($filters['leave_type']) && $filters['leave_type'] !== 'all') {
            $query->where('leave_type_id', $filters['leave_type']);
        }

        $totalRequests = $query->count();
        $pendingRequests = (clone $query)->where('status', 'pending')->count();
        $approvedRequests = (clone $query)->where('status', 'approved')->count();
        $rejectedRequests = (clone $query)->where('status', 'rejected')->count();

        // Get leave type distribution
        $leaveTypeDistribution = (clone $query)
            ->select('leave_types.name', DB::raw('count(*) as count'))
            ->join('leave_types', 'leave_requests.leave_type_id', '=', 'leave_types.id')
            ->groupBy('leave_types.id', 'leave_types.name')
            ->get()
            ->map(function ($item) use ($totalRequests) {
                return [
                    'type' => $item->name,
                    'count' => $item->count,
                    'percentage' => $totalRequests > 0 ? round(($item->count / $totalRequests) * 100, 1) : 0
                ];
            });

        return [
            'totalRequests' => $totalRequests,
            'pendingRequests' => $pendingRequests,
            'approvedRequests' => $approvedRequests,
            'rejectedRequests' => $rejectedRequests,
            'leaveTypeDistribution' => $leaveTypeDistribution,
            'dateRange' => [
                'start' => $dateRange['start']->format('Y-m-d'),
                'end' => $dateRange['end']->format('Y-m-d')
            ],
            'appliedFilters' => $filters
        ];
    }

    /**
     * Generate filename based on report type and format
     */
    private function generateFilename($reportType, $format)
    {
        $date = now()->format('Y-m-d');
        $reportName = $reportType === 'leave_history' ? 'Leave_History' : 'Leave_Statistics';
        
        return $format == 'pdf'?"{$reportName}_{$date}.{$format}":"{$reportName}_{$date}.xlsx";
    }

    /**
     * Export to PDF
     */
    private function exportToPdf($data, $reportType, $includeFields, $filename)
    {
        if ($reportType === 'leave_history') {
            $pdf = Pdf::loadView('exports.pdf.leave_history', [
                'leaveRequests' => $data,
                'includeFields' => $includeFields,
                'generatedAt' => now()->format('Y-m-d H:i:s')
            ]);
        } else {
            $pdf = Pdf::loadView('exports.pdf.leave_statistics', [
                'statistics' => $data,
                'generatedAt' => now()->format('Y-m-d H:i:s')
            ]);
        }

        return $pdf->download($filename);
    }

    /**
     * Export to Excel
     */
    private function exportToExcel($data, $reportType, $includeFields, $filename)
    {
       try {
        Log::info('exporting to excel');
                if ($reportType === 'leave_history') {
                // Ensure data is a collection or array
                if (!is_iterable($data)) {
                    throw new Exception('Invalid leave history data format');
                }
                return Excel::download(new LeaveHistoryExport($data, $includeFields), $filename);
            } else {
                // For statistics, ensure data is properly formatted
                if (!is_array($data)) {
                    throw new Exception('Invalid statistics data format');
                }
                
                // Log the data for debugging
                Log::info('Statistics data for Excel export:', $data);
                
                return Excel::download(new LeaveStatisticsExport($data), $filename);
            }
        } catch (Exception $e) {
            Log::error('Excel export failed:', [
                'error' => $e->getMessage(),
                'reportType' => $reportType,
                'dataType' => gettype($data),
                'filename' => $filename
            ]);
            throw $e;
        }
    }

    /**
     * Export to CSV
     */
    private function exportToCsv($data, $reportType, $includeFields, $filename)
    {
        if ($reportType === 'leave_history') {
            $headers = $this->getLeaveHistoryHeaders($includeFields);
            $csvData = $this->formatLeaveHistoryForCsv($data, $includeFields);
        } else {
            $headers = ['Metric', 'Value'];
            $csvData = $this->formatStatisticsForCsv($data);
        }

        $content = $this->arrayToCsv($headers, $csvData);
        
        return response($content)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    /**
     * Get headers for leave history CSV based on included fields
     */
    private function getLeaveHistoryHeaders($includeFields)
    {
        $headers = [];
        
        if (empty($includeFields) || ($includeFields['employee_name'] ?? false)) {
            $headers[] = 'Employee Name';
        }
        if (empty($includeFields) || ($includeFields['leave_type'] ?? false)) {
            $headers[] = 'Leave Type';
        }
        if (empty($includeFields) || ($includeFields['dates'] ?? false)) {
            $headers = array_merge($headers, ['Start Date', 'End Date', 'Days']);
        }
        if (empty($includeFields) || ($includeFields['status'] ?? false)) {
            $headers[] = 'Status';
        }
        if (empty($includeFields) || ($includeFields['reason'] ?? false)) {
            $headers[] = 'Reason';
        }
        if (empty($includeFields) || ($includeFields['approver'] ?? false)) {
            $headers[] = 'Approver';
        }

        return $headers;
    }

    /**
     * Format leave history data for CSV
     */
    private function formatLeaveHistoryForCsv($data, $includeFields)
    {
        return $data->map(function ($request) use ($includeFields) {
            $row = [];
            
            if (empty($includeFields) || ($includeFields['employee_name'] ?? false)) {
                $row[] = $request->user->name ?? 'N/A';
            }
            if (empty($includeFields) || ($includeFields['leave_type'] ?? false)) {
                $row[] = $request->leaveType->name ?? 'N/A';
            }
            if (empty($includeFields) || ($includeFields['dates'] ?? false)) {
                $row[] = $request->start_date;
                $row[] = $request->end_date;
                $row[] = $request->days;
            }
            if (empty($includeFields) || ($includeFields['status'] ?? false)) {
                $row[] = ucfirst($request->status);
            }
            if (empty($includeFields) || ($includeFields['reason'] ?? false)) {
                $row[] = $request->reason ?? 'N/A';
            }
            if (empty($includeFields) || ($includeFields['approver'] ?? false)) {
                $row[] = $request->approver->name ?? 'N/A';
            }

            return $row;
        })->toArray();
    }

    /**
     * Format statistics data for CSV
     */
    private function formatStatisticsForCsv($data)
    {
        $rows = [
            ['Total Requests', $data['totalRequests']],
            ['Pending Requests', $data['pendingRequests']],
            ['Approved Requests', $data['approvedRequests']],
            ['Rejected Requests', $data['rejectedRequests']],
            ['', ''], // Empty row
            ['Leave Type Distribution', ''],
        ];

        foreach ($data['leaveTypeDistribution'] as $type) {
            $rows[] = [$type['type'], "{$type['count']} ({$type['percentage']}%)"];
        }

        return $rows;
    }

    /**
     * Convert array data to CSV string
     */
    private function arrayToCsv($headers, $data)
    {
        $output = fopen('php://temp', 'r+');
        
        // Add headers
        fputcsv($output, $headers);
        
        // Add data rows
        foreach ($data as $row) {
            fputcsv($output, $row);
        }
        
        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);
        
        return $csv;
    }
}
