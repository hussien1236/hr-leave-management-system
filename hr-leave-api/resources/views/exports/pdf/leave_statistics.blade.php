{{-- resources/views/exports/pdf/leave_statistics.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Leave Statistics Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            color: #333;
        }
        .meta {
            margin-bottom: 20px;
            font-size: 12px;
            color: #666;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-box {
            border: 1px solid #ddd;
            padding: 15px;
            text-align: center;
            background-color: #f8f9fa;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        .stat-label {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0 10px 0;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Leave Statistics Report</h1>
    </div>
    
    <div class="meta">
        <p><strong>Generated on:</strong> {{ $generatedAt }}</p>
        <p><strong>Period:</strong> {{ $statistics['dateRange']['start'] }} to {{ $statistics['dateRange']['end'] }}</p>
    </div>

    <div class="stats-grid">
        <div class="stat-box">
            <div class="stat-number">{{ $statistics['totalRequests'] }}</div>
            <div class="stat-label">Total Requests</div>
        </div>
        <div class="stat-box">
            <div class="stat-number">{{ $statistics['pendingRequests'] }}</div>
            <div class="stat-label">Pending Requests</div>
        </div>
        <div class="stat-box">
            <div class="stat-number">{{ $statistics['approvedRequests'] }}</div>
            <div class="stat-label">Approved Requests</div>
        </div>
        <div class="stat-box">
            <div class="stat-number">{{ $statistics['rejectedRequests'] }}</div>
            <div class="stat-label">Rejected Requests</div>
        </div>
    </div>

    <h2 class="section-title">Leave Type Distribution</h2>
    <table>
        <thead>
            <tr>
                <th>Leave Type</th>
                <th>Count</th>
                <th>Percentage</th>
            </tr>
        </thead>
        <tbody>
            @foreach($statistics['leaveTypeDistribution'] as $type)
                <tr>
                    <td>{{ $type['type'] }}</td>
                    <td>{{ $type['count'] }}</td>
                    <td>{{ $type['percentage'] }}%</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    @if(!empty($statistics['departmentDistribution']))
        <h2 class="section-title">Department Distribution</h2>
        <table>
            <thead>
                <tr>
                    <th>Department</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                @foreach($statistics['departmentDistribution'] as $dept)
                    <tr>
                        <td>{{ $dept['department'] }}</td>
                        <td>{{ $dept['count'] }}</td>
                        <td>{{ $dept['percentage'] }}%</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    @if(!empty($statistics['appliedFilters']))
        <h2 class="section-title">Applied Filters</h2>
        <table>
            <thead>
                <tr>
                    <th>Filter Type</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                @foreach($statistics['appliedFilters'] as $filterType => $filterValue)
                    @if($filterValue !== 'all' && !empty($filterValue))
                        <tr>
                            <td>{{ ucfirst(str_replace('_', ' ', $filterType)) }}</td>
                            <td>{{ $filterValue }}</td>
                        </tr>
                    @endif
                @endforeach
            </tbody>
        </table>
    @endif
</body>
</html>