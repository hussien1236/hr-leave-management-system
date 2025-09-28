import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  Calendar, 
  Users, 
  BarChart3, 
  Filter,
  X,
  CheckCircle
} from 'lucide-react';
import api from '../api/axios';

export default function ExportReports() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    reportType: 'leave_history',
    format: 'pdf',
    dateRange: 'last_month',
    customStartDate: '',
    customEndDate: '',
    includeFields: {
      employee_name: true,
      leave_type: true,
      dates: true,
      status: true,
      reason: true,
      approver: true
    },
    filters: {
      status: 'all',
      department: 'all',
      leave_type: 'all'
    }
  });
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [statistics, setStatistics] = useState(null);

  // Fetch dropdown data on component mount
  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      setLoading(true);
      
        const leaveTypesResponse = await api.get('/leave-types');
        const statsResponse = await api.get('/stats');
        const statsData = statsResponse.data;
        statsData['total_requests'] = statsData.pending_requests + statsData.approved_requests + statsData.rejected_requests;  
      setLeaveTypes(leaveTypesResponse.data || []);
      setStatistics(statsData || null);

    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      alert('Failed to load form data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field, value) => {
    setExportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFieldToggle = (field) => {
    setExportConfig(prev => ({
      ...prev,
      includeFields: {
        ...prev.includeFields,
        [field]: !prev.includeFields[field]
      }
    }));
  };

  const handleFilterChange = (filterType, value) => {
    setExportConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: value
      }
    }));
  };

  const handleExport = async () => {
  setIsExporting(true);

  try {
    const exportParams = {
      report_type: exportConfig.reportType,
      format: exportConfig.format,
      date_range: exportConfig.dateRange,
      custom_start_date: exportConfig.customStartDate,
      custom_end_date: exportConfig.customEndDate,
      include_fields: exportConfig.includeFields,
      filters: exportConfig.filters
    };

    // Always expect a blob for file downloads
    const response = await fetch('http://localhost:8000/api/export-reports', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(exportParams),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    // Get file extension
    let fileExtension = exportConfig.format === 'excel' ? 'xlsx' : exportConfig.format;

    // Download as blob
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${exportConfig.reportType}_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    setShowExportModal(false);

  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Please try again.');
  } finally {
    setIsExporting(false);
  }
};

  const ExportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Export Reports</h2>
          <button 
            onClick={() => setShowExportModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  exportConfig.reportType === 'leave_history' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleConfigChange('reportType', 'leave_history')}
              >
                <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                <h3 className="font-medium">Leave History</h3>
                <p className="text-sm text-gray-600">Individual leave requests</p>
              </div>
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  exportConfig.reportType === 'statistics' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleConfigChange('reportType', 'statistics')}
              >
                <BarChart3 className="w-6 h-6 text-blue-600 mb-2" />
                <h3 className="font-medium">Statistics</h3>
                <p className="text-sm text-gray-600">Summary and analytics</p>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
            <div className="flex space-x-3">
              {['pdf', 'excel', 'csv'].map(format => (
                <label key={format} className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={exportConfig.format === format}
                    onChange={(e) => handleConfigChange('format', e.target.value)}
                    className="mr-2"
                  />
                  <span className="capitalize">{format === 'excel' ? 'Excel' : format.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
            <select 
              value={exportConfig.dateRange}
              onChange={(e) => handleConfigChange('dateRange', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="last_week">Last Week</option>
              <option value="last_month">Last Month</option>
              <option value="last_quarter">Last Quarter</option>
              <option value="last_year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
            
            {exportConfig.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={exportConfig.customStartDate}
                    onChange={(e) => handleConfigChange('customStartDate', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={exportConfig.customEndDate}
                    onChange={(e) => handleConfigChange('customEndDate', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Include Fields (for leave history) */}
          {exportConfig.reportType === 'leave_history' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Include Fields</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(exportConfig.includeFields).map(([field, checked]) => (
                  <label key={field} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleFieldToggle(field)}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{field.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Filters</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Status</label>
                <select 
                  value={exportConfig.filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Leave Type</label>
                <select 
                  value={exportConfig.filters.leave_type}
                  onChange={(e) => handleFilterChange('leave_type', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  {leaveTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={() => setShowExportModal(false)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Export Reports</h2>
      
      {/* Quick Export Options with Dynamic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <FileText className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-medium text-gray-900 mb-2">Leave History</h3>
          <p className="text-sm text-gray-600 mb-1">Export all leave requests with details</p>
          {statistics && (
            <p className="text-xs text-gray-500 mb-3">
              {statistics.total_requests || 0} total requests
            </p>
          )}
          <button 
            onClick={() => {
              setExportConfig(prev => ({ ...prev, reportType: 'leave_history' }));
              setShowExportModal(true);
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Configure & Export
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <BarChart3 className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-medium text-gray-900 mb-2">Statistics Report</h3>
          <p className="text-sm text-gray-600 mb-1">Export analytics and summaries</p>
          {statistics && (
            <p className="text-xs text-gray-500 mb-3">
              {statistics.total_users || 0} employees
            </p>
          )}
          <button 
            onClick={() => {
              setExportConfig(prev => ({ ...prev, reportType: 'statistics' }));
              setShowExportModal(true);
            }}
            className="text-sm text-green-600 hover:text-green-800 font-medium"
          >
            Configure & Export
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <Users className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-medium text-gray-900 mb-2">Quick Stats</h3>
          <div className="text-sm text-gray-600 space-y-1">
            {statistics ? (
              <>
                <p>Pending: {statistics.pendingRequests || 0}</p>
                <p>Approved: {statistics.approvedRequests || 0}</p>
                <p>Rejected: {statistics.rejectedRequests || 0}</p>
              </>
            ) : (
              <p>Loading stats...</p>
            )}
          </div>
        </div>
      </div>
      
      {showExportModal && <ExportModal />}
    </div>
  );
}