<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\UpdateLeaveTypeRequest;
use App\Models\LeaveType;

class LeaveTypeController extends Controller
{
    public function getAllLeaveTypes()
    {
        $leaveTypes = LeaveType::all();
        return response()->json($leaveTypes,200);
    }
    public function createLeaveType(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'default_days' => 'required|integer|min:0',
        ]);
        $leaveType = LeaveType::create($validated);
        return response()->json($leaveType,201);
    }
    public function updateLeaveType(UpdateLeaveTypeRequest $request,int $id)
    {
        $validated = $request->validated();
        $leaveType = LeaveType::find($id);
        if(!$leaveType) return response()->json(['message'=>'Leave type not found'],404);
        $leaveType->update($validated);
        return response()->json($leaveType,200);
    }
    public function deleteLeaveType(int $id)
    {
        $leaveType = LeaveType::find($id);
        if(!$leaveType) return response()->json(['message'=>'Leave type not found'],404);
        $leaveType->delete();
        return response()->json(['message'=>'Leave type deleted successfully'],200);
    }
}
