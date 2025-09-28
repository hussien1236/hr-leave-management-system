<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LeaveTypeController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\StatsController;
use Illuminate\Support\Facades\Broadcast;

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:api')->group(function () {
    Broadcast::routes(['middleware' => ['auth:api']]);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/leave-types', [LeaveTypeController::class, 'getAllLeaveTypes']);
    Route::middleware('isAdmin')->group(function () {
        Route::post('/leave-types', [LeaveTypeController::class, 'createLeaveType']);
        Route::put('/leave-type/{id}', [LeaveTypeController::class, 'updateLeaveType']);
        Route::delete('/leave-type/{id}', [LeaveTypeController::class, 'deleteLeaveType']);
        Route::post('/create-user', [AuthController::class, 'createUser']);
    });
    Route::middleware('isEmployee')->group(function () {
        Route::post('/leave-request', [LeaveRequestController::class, 'createLeaveRequest']);
        Route::get('/my-leave-requests', [LeaveRequestController::class, 'getMyLeaveRequests']);
        Route::get('/statsForMe', [StatsController::class, 'getStatsForMe']);
    });
    Route::middleware('isAdminOrManager')->group(function () {
        Route::get('/leave-requests', [LeaveRequestController::class, 'getLeaveRequests']);
        Route::get('/stats', [StatsController::class, 'getStats']);
        Route::get('/leave-distribution', [StatsController::class, 'getLeaveDistribution']);
        Route::get('/monthly-requests', [StatsController::class, 'getMonthlyRequests']);
        Route::put('/leave-requests/{id}/approve', [LeaveRequestController::class, 'approve']);
        Route::put('/leave-requests/{id}/reject', [LeaveRequestController::class, 'reject']);
        Route::post('/export-reports', [App\Http\Controllers\ReportsController::class, 'exportReports']);
    });
});
