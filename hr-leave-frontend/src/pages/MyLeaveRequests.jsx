import React, { useEffect, useState } from 'react'
import { Edit, Trash2, Calendar, Clock, User } from 'lucide-react';
import api from '../api/axios';

const MyLeaveRequests = () => {
    const [myLeaveRequests, setMyLeaveRequests] = useState([]);
    useEffect(()=>{
      const fetchLeaveRequests = async ()=>{
        try{
          const res = await api.get('/my-leave-requests');
          setMyLeaveRequests(res.data);
        }catch{
            console.log('error retrieving the data');
        }finally{
          
        }
      }
        fetchLeaveRequests();
    },[]);
  return (
    <>
    <div className="text-lg font-semibold mb-4">My Leave Requests</div>
    {myLeaveRequests && myLeaveRequests.length > 0 ? (
        <div className='flex flex-col space-y-3'>
            {myLeaveRequests.map((leaveRequest, index) => (
                <div key={leaveRequest.id || index} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-900">
                                        {new Date(leaveRequest.start_date).toLocaleDateString()} - {new Date(leaveRequest.end_date).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">{leaveRequest.days} days</span>
                                </div>
                            </div>
                            
                            <div className="mb-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                    ${leaveRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                      leaveRequest.status === 'approved' ? 'bg-green-100 text-green-800' :
                                      leaveRequest.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                      'bg-gray-100 text-gray-800'}`}>
                                    {leaveRequest.status}
                                </span>
                            </div>
                            
                            {leaveRequest.reason && (
                                <p className="text-sm text-gray-700 mb-2">
                                    <span className="font-medium">Reason:</span> {leaveRequest.reason}
                                </p>
                            )}
                            
                            <div className="text-xs text-gray-500">
                                Submitted on {new Date(leaveRequest.created_at).toLocaleDateString()}
                                {leaveRequest.approved_by && (
                                    <span className="ml-2">• Approved by User {leaveRequest.approved_by}</span>
                                )}
                            </div>
                        </div>
                        
                        {/* Actions - only show for pending requests
                        {leaveRequest.status === 'pending' && (
                            <div className="flex items-center space-x-2 ml-4">
                                <button 
                                    onClick={() => handleEdit(leaveRequest)}
                                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(leaveRequest.id)}
                                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )} */}
                    </div>
                </div>
            ))}
        </div>
    ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 italic">No leave requests yet</p>
        </div>
    )}
</>
  )
}

export default MyLeaveRequests