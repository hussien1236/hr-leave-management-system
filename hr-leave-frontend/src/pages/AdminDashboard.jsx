import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  TrendingUp,
  Calendar,
  PieChart,
  BarChart3
} from 'lucide-react';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie } from 'recharts';
import api from '../api/axios';
import StatCard from '../components/StatCard';

export default function AdminDashboard() {
  // Sample data - replace with actual API calls
  const [stats, setStats] = useState({});
  const [leaveDistribution, setLeaveDistribution] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
 
  useEffect(() => {
    const fetchStats = async () => {
      try{
      const fetchedStats = await api.get('/stats');
      setStats(fetchedStats.data);
      console.log('Fetched stats:', fetchedStats.data);
      }catch(err){
        console.error('Error fetching stats:', err);
      }
    };
    const fetchLeaveDistribution = async () => {
      try {
        const distribution = await api.get('/leave-distribution');
        // Transform data for recharts
        const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
        const formatted = distribution.data.map((item, idx) => ({
          name: item.leave_type?.name || 'Unknown',
          value: item.percentage,
          color: colors[idx % colors.length]
        }));
        setLeaveDistribution(formatted);
        console.log('Fetched leave distribution:', formatted);
      } catch (err) {
        console.error('Error fetching leave distribution:', err);
      }};
    const fetchMonthlyTrends = async () => {
      try{
      const trends = await api.get('/monthly-requests');
      setMonthlyTrends(trends.data);
      console.log('Fetched monthly trends:', trends.data);
      }catch(err){
        console.error('Error fetching monthly trends:', err);
      }};
    fetchStats();
    fetchLeaveDistribution();
    fetchMonthlyTrends();
  }, []);
  const [selectedChart, setSelectedChart] = useState('distribution');

  // Calculate additional metrics
  const totalRequests = stats.pending_requests + 
                       stats.approved_requests + 
                       stats.rejected_requests;
  
  const approvalRate = totalRequests > 0 ? 
    Math.round((stats.approved_requests / totalRequests) * 100) : 0;

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of leave requests and employee management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Pending Requests"
            value={stats.pending_requests}
            icon={Clock}
            color="#F59E0B"
            trend="up"
            trendValue={15}
          />
          <StatCard
            title="Approved Requests"
            value={stats.approved_requests}
            icon={CheckCircle}
            color="#10B981"
            trend="up"
            trendValue={8}
          />
          <StatCard
            title="Rejected Requests"
            value={stats.rejected_requests}
            icon={XCircle}
            color="#EF4444"
            trend="down"
            trendValue={5}
          />
          <StatCard
            title="Total Employees"
            value={stats.total_users}
            icon={Users}
            color="#3B82F6"
            trend="up"
            trendValue={3}
          />
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalRequests}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{approvalRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">2.5 days</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Leave Distribution Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Leave Distribution by Type</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedChart('distribution')}
                  className={`p-2 rounded ${selectedChart === 'distribution' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <PieChart className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedChart('trends')}
                  className={`p-2 rounded ${selectedChart === 'trends' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {selectedChart === 'distribution' ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={leaveDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {leaveDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" />
                    <Bar dataKey="approved" stackId="a" fill="#10B981" name="Approved" />
                    <Bar dataKey="rejected" stackId="a" fill="#EF4444" name="Rejected" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Legend and Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Leave Type Breakdown</h3>
            <div className="space-y-4">
              {leaveDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{item.value}%</div>
                    <div className="text-sm text-gray-500">{Math.round(totalRequests * item.value / 100)} requests</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  View All Pending Requests
                </button>
                <button className="w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                  Generate Monthly Report
                </button>
                <button className="w-full text-left px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                  Manage Leave Types
                </button>
                <button className="w-full text-left px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}