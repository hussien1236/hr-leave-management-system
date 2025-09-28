{{-- resources/views/exports/pdf/leave_history.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Leave History Report</title>
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
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-size: 11px;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .status-approved { color: #28a745; font-weight: bold; }
        .status-pending { color: #ffc107; font-weight: bold; }
        .status-rejected { color: #dc3545; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Leave History Report</h1>
    </div>
    
    <div class="meta">
        <p><strong>Generated on:</strong> {{ $generatedAt }}</p>
        <p><strong>Total Records:</strong> {{ count($leaveRequests) }}</p>
    </div>

    <table>
        <thead>
            <tr>
                @if(empty($includeFields) || ($includeFields['employee_name'] ?? false))
                    <th>Employee Name</th>
                @endif
                @if(empty($includeFields) || ($includeFields['leave_type'] ?? false))
                    <th>Leave Type</th>
                @endif
                @if(empty($includeFields) || ($includeFields['dates'] ?? false))
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                @endif
                @if(empty($includeFields) || ($includeFields['status'] ?? false))
                    <th>Status</th>
                @endif
                @if(empty($includeFields) || ($includeFields['reason'] ?? false))
                    <th>Reason</th>
                @endif
                @if(empty($includeFields) || ($includeFields['approver'] ?? false))
                    <th>Approver</th>
                @endif
            </tr>
        </thead>
        <tbody>
            @foreach($leaveRequests as $request)
                <tr>
                    @if(empty($includeFields) || ($includeFields['employee_name'] ?? false))
                        <td>{{ $request->user->name ?? 'N/A' }}</td>
                    @endif
                    @if(empty($includeFields) || ($includeFields['leave_type'] ?? false))
                        <td>{{ $request->leaveType->name ?? 'N/A' }}</td>
                    @endif
                    @if(empty($includeFields) || ($includeFields['dates'] ?? false))
                        <td>{{ $request->start_date }}</td>
                        <td>{{ $request->end_date }}</td>
                        <td>{{ $request->days }}</td>
                    @endif
                    @if(empty($includeFields) || ($includeFields['status'] ?? false))
                        <td class="status-{{ $request->status }}">{{ ucfirst($request->status) }}</td>
                    @endif
                    @if(empty($includeFields) || ($includeFields['reason'] ?? false))
                        <td>{{ $request->reason ?? 'N/A' }}</td>
                    @endif
                    @if(empty($includeFields) || ($includeFields['approver'] ?? false))
                        <td>{{ $request->approver->name ?? 'N/A' }}</td>
                    @endif
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>

