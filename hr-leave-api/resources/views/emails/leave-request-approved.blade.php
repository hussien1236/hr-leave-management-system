<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Leave Request Approved</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .footer { text-align: center; padding: 20px; color: #666; }
        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Leave Request Approved ✓</h2>
        </div>
        <div class="content">
            <p>Dear {{ $employeeName }},</p>
            <p>Great news! Your leave request has been approved.</p>
            
            <div class="details">
                <h3>Approved Leave Details:</h3>
                <p><strong>Leave Type:</strong> {{ $leaveType }}</p>
                <p><strong>Start Date:</strong> {{ \Carbon\Carbon::parse($startDate)->format('M d, Y') }}</p>
                <p><strong>End Date:</strong> {{ \Carbon\Carbon::parse($endDate)->format('M d, Y') }}</p>
                <p><strong>Status:</strong> <span style="color: #28a745;">Approved</span></p>
            </div>
            
            <p>Enjoy your time off!</p>
        </div>
        <div class="footer">
            <p>This is an automated message from the HR Leave Management System.</p>
        </div>
    </div>
</body>
</html>
