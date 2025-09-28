import React, { useEffect, useState } from 'react'
import api from '../api/axios';
import { AlertCircle, Calendar, CheckCircle, Clock, FileText, Send } from 'lucide-react';

const RequestLeaveForm = () => {
    const [formData, setFormData] = useState({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: ''
      });
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [totalDays, setTotalDays] = useState(0);
    useEffect(()=>{
      async function fetchLeaveTypes(){
        try {
          setIsLoadingTypes(true);
          const res = await api.get('leave-types');
          setLeaveTypes(Array.isArray(res.data) ? res.data : []);
        } catch {
          setError('Failed to load leave types.');
          setLeaveTypes([]);
        } finally {
          setIsLoadingTypes(false);
        }
      }
      fetchLeaveTypes();
    },[])
    useEffect(() => {
        if (formData.startDate && formData.endDate) {
          const start = new Date(formData.startDate);
          const end = new Date(formData.endDate);
          
          if (end >= start) {
            const timeDiff = end.getTime() - start.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end days
            setTotalDays(daysDiff);
          } else {
            setTotalDays(0);
          }
        } else {
          setTotalDays(0);
        }
      }, [formData.startDate, formData.endDate]);
    
      const handleInputChange = (field, value) => {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
        
        // Clear error when user starts typing
        if (error) setError('');
        if (success) setSuccess(false);
      };
    
      const validateForm = () => {
        if (!formData.leaveType) {
          setError('Please select a leave type.');
          return false;
        }
        if (!formData.startDate) {
          setError('Please select a start date.');
          return false;
        }
        if (!formData.endDate) {
          setError('Please select an end date.');
          return false;
        }
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
          setError('End date cannot be earlier than start date.');
          return false;
        }
        if (!formData.reason.trim()) {
          setError('Please provide a reason for your leave request.');
          return false;
        }
        if (formData.reason.trim().length < 10) {
          setError('Please provide a more detailed reason (at least 10 characters).');
          return false;
        }
        return true;
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        setError('');
        
        try {
          await api.post('leave-request',{
            'leave_type_id': formData.leaveType,
            'start_date': formData.startDate,
            'end_date': formData.endDate,
            'days': totalDays,
            'reason': formData.reason,
          });
          setSuccess(true);
          
          // Reset form after success
          setTimeout(() => {
            setFormData({
              leaveType: '',
              startDate: '',
              endDate: '',
              reason: ''
            });
            setSuccess(false);
          }, 3000);
          
        } catch {
          setError('Failed to submit leave request. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
    
      const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
      };
    
      const selectedLeaveType = leaveTypes.find(type => type.id === Number(formData.leaveType));    
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
          <div className="max-w-2xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Leave</h1>
              <p className="text-gray-600">Submit your leave application for approval</p>
            </div>
    
            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              
              {/* Success Message */}
              {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div className="text-sm text-green-700">
                    <p className="font-medium">Leave request submitted successfully!</p>
                    <p>You will be notified once it's reviewed by your manager.</p>
                  </div>
                </div>
              )}
    
              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
    
              <div className="space-y-6">
                
                {/* Leave Type Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="leaveType" className="text-sm font-medium text-gray-700">
                    Leave Type *
                  </label>
                  {isLoadingTypes ? (
                    <div className="relative">
                      <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-gray-500">Loading leave types...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        id="leaveType"
                        value={formData.leaveType}
                        onChange={(e) => handleInputChange('leaveType', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white outline-none"
                        required
                      >
                        <option value="">Select leave type</option>
                        {leaveTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {selectedLeaveType && (
                    <p className="text-xs text-gray-500 mt-1">{selectedLeaveType.description}</p>
                  )}
                </div>
    
                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Start Date */}
                  <div className="space-y-2">
                    <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                      Start Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        min={getMinDate()}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white outline-none"
                        required
                      />
                    </div>
                  </div>
    
                  {/* End Date */}
                  <div className="space-y-2">
                    <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                      End Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        min={formData.startDate || getMinDate()}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
    
                {/* Total Days Display */}
                {totalDays > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Total leave duration:</span> {totalDays} day{totalDays !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
    
                {/* Reason Textarea */}
                <div className="space-y-2">
                  <label htmlFor="reason" className="text-sm font-medium text-gray-700">
                    Reason for Leave *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => handleInputChange('reason', e.target.value)}
                      placeholder="Please provide a detailed reason for your leave request..."
                      rows="4"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white outline-none resize-none"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.reason.length}/500 characters (minimum 10 required)
                  </p>
                </div>
    
                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || isLoadingTypes}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-4 focus:ring-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting Request...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send className="w-5 h-5 mr-2" />
                      Submit Leave Request
                    </div>
                  )}
                </button>
              </div>
            </div>
    
            {/* Info Card */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Important Notes:</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Leave requests should be submitted at least 48 hours in advance</li>
                <li>• Emergency leave requests will be reviewed within 24 hours</li>
                <li>• You will receive an email notification once your request is processed</li>
                <li>• For questions, contact HR at hr@company.com</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

export default RequestLeaveForm