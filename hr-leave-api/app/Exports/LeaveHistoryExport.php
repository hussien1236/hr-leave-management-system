<?php

// app/Exports/LeaveHistoryExport.php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LeaveHistoryExport implements FromCollection, WithHeadings, WithStyles, WithColumnWidths
{
    protected $data;
    protected $includeFields;

    public function __construct($data, $includeFields = [])
    {
        $this->data = $data;
        $this->includeFields = $includeFields;
    }

    public function collection()
    {
        return $this->data->map(function ($request) {
            $row = [];
            
            if (empty($this->includeFields) || ($this->includeFields['employee_name'] ?? false)) {
                $row['employee_name'] = $request->user->name ?? 'N/A';
            }
            if (empty($this->includeFields) || ($this->includeFields['leave_type'] ?? false)) {
                $row['leave_type'] = $request->leaveType->name ?? 'N/A';
            }
            if (empty($this->includeFields) || ($this->includeFields['dates'] ?? false)) {
                $row['start_date'] = $request->start_date;
                $row['end_date'] = $request->end_date;
                $row['days'] = $request->days;
            }
            if (empty($this->includeFields) || ($this->includeFields['status'] ?? false)) {
                $row['status'] = ucfirst($request->status);
            }
            if (empty($this->includeFields) || ($this->includeFields['reason'] ?? false)) {
                $row['reason'] = $request->reason ?? 'N/A';
            }
            if (empty($this->includeFields) || ($this->includeFields['approver'] ?? false)) {
                $row['approver'] = $request->approver->name ?? 'N/A';
            }

            return $row;
        });
    }

    public function headings(): array
    {
        $headers = [];
        
        if (empty($this->includeFields) || ($this->includeFields['employee_name'] ?? false)) {
            $headers[] = 'Employee Name';
        }
        if (empty($this->includeFields) || ($this->includeFields['leave_type'] ?? false)) {
            $headers[] = 'Leave Type';
        }
        if (empty($this->includeFields) || ($this->includeFields['dates'] ?? false)) {
            $headers = array_merge($headers, ['Start Date', 'End Date', 'Days']);
        }
        if (empty($this->includeFields) || ($this->includeFields['status'] ?? false)) {
            $headers[] = 'Status';
        }
        if (empty($this->includeFields) || ($this->includeFields['reason'] ?? false)) {
            $headers[] = 'Reason';
        }
        if (empty($this->includeFields) || ($this->includeFields['approver'] ?? false)) {
            $headers[] = 'Approver';
        }

        return $headers;
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 20, // Employee Name
            'B' => 15, // Leave Type
            'C' => 12, // Start Date
            'D' => 12, // End Date
            'E' => 8,  // Days
            'F' => 12, // Status
            'G' => 30, // Reason
            'H' => 20, // Approver
        ];
    }
}

