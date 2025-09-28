import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import api from '../api/axios';
import StatCard from '../components/StatCard';
import 'react-toastify/dist/ReactToastify.css';

const EmployeeDashboard = () => {

  const [stats, setStats] = useState({});
  const nav = useNavigate();
  useEffect(() => {
    const fetchStats = async () => {
      try{
      const fetchedStats = await api.get('/statsForMe');
      setStats(fetchedStats.data);
      console.log('Fetched stats:', fetchedStats.data);
      }catch(err){
        console.error('Error fetching stats:', err);
      }
    };
   fetchStats();
  }, []);
   const totalRequests = stats.pending_requests + 
                       stats.approved_requests + 
                       stats.rejected_requests;
  
  const approvalRate = totalRequests > 0 ? 
    Math.round((stats.approved_requests / totalRequests) * 100) : 0;
  return (
    <>
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
      </div>
    </>
  )
}


export default EmployeeDashboard