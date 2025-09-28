<?php

// app/Exports/LeaveStatisticsExport.php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LeaveStatisticsExport implements FromArray, WithHeadings, WithStyles, WithColumnWidths, WithTitle
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function array(): array
    {
        $rows = [
            ['Total Requests', $this->data['totalRequests']],
            ['Pending Requests', $this->data['pendingRequests']],
            ['Approved Requests', $this->data['approvedRequests']],
            ['Rejected Requests', $this->data['rejectedRequests']],
            ['', ''], // Empty row
            ['Leave Type Distribution', ''],
        ];

        foreach ($this->data['leaveTypeDistribution'] as $type) {
            $rows[] = [$type['type'], "{$type['count']} ({$type['percentage']}%)"];
        }

        $rows[] = ['', '']; 
        $rows[] = ['Date Range', $this->data['dateRange']['start'] . ' to ' . $this->data['dateRange']['end']];
        $rows[] = ['Generated At', now()->format('Y-m-d H:i:s')];

        return $rows;
    }

    public function headings(): array
    {
        return ['Metric', 'Value'];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            'A:A' => ['font' => ['bold' => true]],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 25,
            'B' => 20,
        ];
    }

    public function title(): string
    {
        return 'Leave Statistics';
    }
}