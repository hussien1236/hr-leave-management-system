<?php

namespace App\Http\Controllers;

use App\Events\LeaveStatusUpdated;
use App\Events\RequestSubmitted;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use App\Http\Requests\CreateLeaveRequestRequest;
use App\Mail\LeaveRequestApproved;
use App\Mail\LeaveRequestRejected;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class LeaveRequestController extends Controller
{
    public function createLeaveRequest (CreateLeaveRequestRequest $request)
    {
        // $this->authorize('employee');
        $validated = $request->validated();
        $validated['user_id'] = auth('api')->user()->id;
        $leaveRequest = LeaveRequest::create($validated);
        RequestSubmitted::dispatch($leaveRequest);
        return response()->json($leaveRequest, 201);
    }
    public function getMyLeaveRequests(){
        $requests = LeaveRequest::where('user_id', auth('api')->user()->id)->get();
        return response()->json($requests,200);
    }
    public function getLeaveRequests(){
        // if (! in_array(auth('api')->user()->role, ['admin', 'manager'])) {
        //     return response()->json(['error' => 'Forbidden'], 403);
        // }
        $requests = LeaveRequest::with('user', 'leaveType')->get();
        return response()->json($requests, 200);
    }
    public function approve($id){
        try{
        $request = LeaveRequest::with('user')->find($id);
        if(!$request) return response()->json(['message'=>'Leave request not found'],404);
        $request->update(['status'=>'approved', 'approved_by' => Auth::id()]);
        Mail::to($request->user->email)->send(new LeaveRequestApproved($request));
        LeaveStatusUpdated::dispatch($request);
        return response()->json($request, 200);
        } catch (\Exception $e) {
            Log::error('Error approving leave request: ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred while approving the leave request. Please try again later.'], 500);
        }
    }
    public function reject($id){
    try{
    $request = LeaveRequest::with('user')->find($id);
    if(!$request) return response()->json(['message'=>'Leave request not found'],404);
    $request->update(['status'=>'rejected']);
    Mail::to($request->user->email)->send(new LeaveRequestRejected($request));
    LeaveStatusUpdated::dispatch($request);
    return response()->json($request, 200);
    } catch (\Exception $e) {
        Log::error('Error rejecting leave request: ' . $e->getMessage());
        return response()->json(['message' => 'An error occurred while rejecting the leave request. Please try again later.'], 500);
    }
}
}
