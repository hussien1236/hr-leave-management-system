<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function getStats()
    {
        $total_users = User::count();
        $requests = LeaveRequest::get();
        $approved_requests = $requests->where('status', 'approved')->count();
        $pending_requests = $requests->where('status', 'pending')->count();
        $rejected_requests = $requests->where('status', 'rejected')->count();
        $stats = [
            'total_users'=> $total_users,
            'approved_requests'=> $approved_requests,
            'pending_requests' => $pending_requests,
            'rejected_requests' => $rejected_requests,
        ];
        return response()->json($stats);
    }
       public function getStatsForMe()
    {
        $requests = LeaveRequest::get();
        $approved_requests = $requests->where('status', 'approved')->where('user_id', auth('api')->user()->id)->count();
        $pending_requests = $requests->where('status', 'pending')->where('user_id', auth('api')->user()->id)->count();
        $rejected_requests = $requests->where('status', 'rejected')->where('user_id', auth('api')->user()->id)->count();
        $stats = [
            'approved_requests'=> $approved_requests,
            'pending_requests' => $pending_requests,
            'rejected_requests' => $rejected_requests,
        ];
        return response()->json($stats);
    }
    public function getLeaveDistribution()
    {
        $total = LeaveRequest::count();
        $distribution = LeaveRequest::selectRaw('leave_type_id, COUNT(*) as count')
            ->groupBy('leave_type_id')
            ->get();
        $distribution = $distribution->map(function($item) use ($total) {
            $item->percentage = $total > 0 ? ($item->count / $total) * 100 : 0;
            $item->leave_type = $item->leaveType ? $item->leaveType->name : 'Unknown';
            return $item;
        });
        return response()->json($distribution);
    }
    public function getMonthlyRequests()
    {
        $statuses = ['pending', 'approved', 'rejected'];
        $results = [];
        foreach ($statuses as $status) {
          $data = LeaveRequest::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
          ->where('status', $status)  
          ->groupBy('month')
            ->orderBy('month')
            ->get();
            foreach ($data as $row) {
                $month = $row->month;
                if (!isset($results[$row->month])) {
                    $results[$row->month] = ['month' => $row->month, 'pending' => 0, 'approved' => 0, 'rejected' => 0];
                }
                $results[$row->month][$status] = $row->count;
            }
        }
        return response()->json(array_values($results));
    }
}
