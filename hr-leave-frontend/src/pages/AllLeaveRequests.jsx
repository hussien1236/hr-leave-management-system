import React, { useEffect, useState } from 'react'
import { Check, X, Calendar, Clock, User, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';
import getEcho from '../echo';

const AllLeaveRequests = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [sortedRequests, setSortedRequests] = useState([]);
    const [user, setUser] = useState();
    // Loading states - tracks which request is being processed and what action
    const [loadingStates, setLoadingStates] = useState({
        approving: null,  // ID of request being approved
        rejecting: null   // ID of request being rejected
    });

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem("user")));
    }, []);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            alert('Access denied. Admins only.');
            window.location.href = '/dashboard'; // Redirect non-admin users
        }
        let channel;
        const Echo = getEcho();
        try {
            channel = Echo.private('manager.notifications')
                .error((error) => {
                    console.error('Echo manager channel error:', error);
                })
                // Add debugging for all events
                .notification((notification) => {
                    console.log('Raw notification received:', notification);
                })
                .listen(".RequestSubmitted", (event) => {
                    // Check different possible structures
                    const leaveData = event.leaveRequest;
                    leaveData.status = 'pending'; 
                    console.log("Leave data:", leaveData);
                    
                    if (leaveData) {
                        setLeaveRequests((prev) => {
                            // Check if this request already exists to prevent duplicates
                            const existingIndex = prev.findIndex(req => req.id === leaveData.id);
                            if (existingIndex !== -1) {
                                // Update existing request
                                const updated = [...prev];
                                updated[existingIndex] = leaveData;
                                return updated;
                            } else {
                                // Add new request
                                return [leaveData, ...prev];
                            }
                        });
                    }
                });
        } catch (err) {
            console.error('Error setting up Echo channel:', err);
        }
        return () => {
            if (channel) {
                console.log('Cleaning up Echo channel');
                try {
                    Echo.leaveChannel(`private-manager.notifications`);
                } catch (error) {
                    console.error('Error leaving channel:', error);
                }
            }
        }
    }, [user]);

    useEffect(() => {
        const fetchLeaveRequests = async () => {
            try {
                const res = await api.get('/leave-requests');
                setLeaveRequests(res.data);
            } catch {
                console.log('error retrieving the data');
            }
        }
        fetchLeaveRequests();
    }, []);

    const handleApprove = async (id) => {
        try {
            // Set loading state for this specific request
            setLoadingStates(prev => ({ ...prev, approving: id }));
            
            const leaveRequest = await api.put(`/leave-requests/${id}/approve`);
            setLeaveRequests((prev) => {
                return prev.map(request =>
                    request.id == id ? leaveRequest.data : request
                )
            })
        } catch (error) {
            console.log('error occurred:', error);
            // You might want to show a proper error message to the user
            alert('Failed to approve request. Please try again.');
        } finally {
            // Clear loading state regardless of success/failure
            setLoadingStates(prev => ({ ...prev, approving: null }));
        }
    }

    const handleReject = async (id) => {
        try {
            // Set loading state for this specific request
            setLoadingStates(prev => ({ ...prev, rejecting: id }));
            
            const leaveRequest = await api.put(`/leave-requests/${id}/reject`);
            setLeaveRequests((prev) => {
                return prev.map(request =>
                    request.id == id ? leaveRequest.data : request
                )
            })
        } catch (error) {
            console.log('error occurred:', error);
            // You might want to show a proper error message to the user
            alert('Failed to reject request. Please try again.');
        } finally {
            // Clear loading state regardless of success/failure
            setLoadingStates(prev => ({ ...prev, rejecting: null }));
        }
    }

    useEffect(() => {
        const sorted = [...leaveRequests].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setSortedRequests(sorted);
    }, [leaveRequests]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    // Helper function to check if any action is loading for a specific request
    const isRequestLoading = (requestId) => {
        return loadingStates.approving === requestId || loadingStates.rejecting === requestId;
    };

    return (
        <>
            <div className="text-lg font-semibold mb-4">Leave Requests Management</div>
            {sortedRequests && sortedRequests.length > 0 ? (
                <div className='flex flex-col space-y-3'>
                    {sortedRequests.map((leaveRequest) => (
                        <div key={`leave-request-${leaveRequest.id}-${leaveRequest.created_at}`} className={`p-4 rounded-lg border shadow-sm
                            ${leaveRequest.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                              leaveRequest.status === 'approved' ? 'bg-green-50 border-green-200' :
                              leaveRequest.status === 'rejected' ? 'bg-red-50 border-red-200' :
                              'bg-white border-gray-200'}`}>
                            
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-4 mb-3">
                                        <div className="flex flex-col space-x-2">
                                            <div className='flex items-center space-x-2'>
                                                <User className="w-5 h-5 text-blue-600" />
                                                <span className="text-base font-semibold text-gray-900">
                                                    User ID: {leaveRequest.user_id}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500">Date Requested: {formatDate(leaveRequest.created_at)}</span>
                                        </div>
                                        {leaveRequest.status === 'pending' && (
                                            <div className="flex items-center space-x-1">
                                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                                                <span className="text-sm text-yellow-700 font-medium">Needs Review</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">Duration</div>
                                                <div className="text-sm text-gray-600">
                                                    {new Date(leaveRequest.start_date).toLocaleDateString()} - {new Date(leaveRequest.end_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">Days</div>
                                                <div className="text-sm text-gray-600">{leaveRequest.days} days</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {leaveRequest.reason && (
                                        <div className="mb-3 p-2 bg-gray-50 rounded">
                                            <span className="text-sm font-medium text-gray-900">Reason:</span>
                                            <p className="text-sm text-gray-700 mt-1">{leaveRequest.reason}</p>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Submitted: {new Date(leaveRequest.created_at).toLocaleDateString()}</span>
                                        <span>Leave Type ID: {leaveRequest.leave_type_id}</span>
                                    </div>
                                </div>
                                
                                {/* Admin Actions */}
                                <div className="ml-6">
                                    {leaveRequest.status === 'pending' ? (
                                        <div className="flex flex-col space-y-2">
                                            <button 
                                                onClick={() => handleApprove(leaveRequest.id)}
                                                disabled={isRequestLoading(leaveRequest.id)}
                                                className={`flex items-center justify-center space-x-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors min-w-[100px] ${
                                                    isRequestLoading(leaveRequest.id)
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-green-600 hover:bg-green-700'
                                                }`}
                                            >
                                                {loadingStates.approving === leaveRequest.id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Approving...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        <span>Approve</span>
                                                    </>
                                                )}
                                            </button>
                                            <button 
                                                onClick={() => handleReject(leaveRequest.id)}
                                                disabled={isRequestLoading(leaveRequest.id)}
                                                className={`flex items-center justify-center space-x-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors min-w-[100px] ${
                                                    isRequestLoading(leaveRequest.id)
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-red-600 hover:bg-red-700'
                                                }`}
                                            >
                                                {loadingStates.rejecting === leaveRequest.id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Rejecting...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <X className="w-4 h-4" />
                                                        <span>Reject</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium
                                                ${leaveRequest.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {leaveRequest.status === 'approved' ? (
                                                    <Check className="w-4 h-4 mr-2" />
                                                ) : (
                                                    <X className="w-4 h-4 mr-2" />
                                                )}
                                                {leaveRequest.status}
                                            </div>
                                            {leaveRequest.approved_by && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    by User {leaveRequest.approved_by}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 italic">No leave requests to review</p>
                </div>
            )}
        </>
    )
}

export default AllLeaveRequests