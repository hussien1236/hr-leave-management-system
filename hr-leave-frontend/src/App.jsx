import { Routes, Route} from 'react-router-dom'
import Login from './pages/Login'
import EmployeeDashboard from './pages/EmployeeDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import ProtectedRoute from './ProtectedRoute'
import RequestLeaveForm from './pages/RequestLeaveForm'
import LeaveTypes from './pages/LeaveTypes'
import MyLeaveRequests from './pages/MyLeaveRequests'
import AllLeaveRequests from './pages/AllLeaveRequests'
import Dashboard from './pages/Dashboard'
import CreateUser from './pages/CreateUser'
import ExportReports from './pages/ExportReports'
import { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify';
import { getEcho } from './echo';

const App = () => { 
const [user, setUser] = useState();
  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user")));
  }, []);
  
 
useEffect(() => {
  console.log("user in app useEffect:", user);
  
  if (!user || !user.id) {
    return;
  }

  const Echo = getEcho();
  
  if (!Echo) {
    console.error('Failed to initialize Echo - no auth token');
    return;
  }

  let channel;
  let ManagerChannel;
  
  try {
    channel = Echo.private(`user.${user.id}`)
      .error((error) => {
        console.error('Echo channel error:', error);
      })
      // Add debugging for all events
      .notification((notification) => {
        console.log('Raw notification received:', notification);
      })
      // Listen for the specific event
      .listen(".LeaveStatusUpdated", (event) => {
        console.log("=== LeaveStatusUpdated Event Debug ===");
        console.log("Full event object:", event);
        console.log("Event keys:", Object.keys(event));
        console.log("Event type:", typeof event);
        console.log("Event JSON:", JSON.stringify(event, null, 2));
        
        // Check if data is nested
        if (event.data) {
          console.log("Event.data:", event.data);
        }
        
        // Check different possible structures
        const leaveData = event.leave || event.data || event;
        console.log("Leave data:", leaveData);
        
        if (leaveData && leaveData.status) {
          if (leaveData.status === "approved") {
            console.log("Leave approved:", leaveData);
            toast.success(`✅ Your leave from ${leaveData.start_date} to ${leaveData.end_date} was approved!`);
          } else if (leaveData.status === "rejected") {
            console.log("Leave rejected:", leaveData);
            toast.error(`❌ Your leave request was rejected. Reason: ${leaveData.reason || "N/A"}`);
          }
        } else {
          console.warn("No leave status found in event");
        }
        console.log("=== End Debug ===");
      })
      // Also try listening with a dot notation (Laravel sometimes sends events this way)
      .listen(".LeaveStatusUpdated", (event) => {
        console.log("Received event with dot notation:", event);
      })
      // Listen to all events on this channel for debugging
      .listenForWhisper('*', (event) => {
        console.log('Whisper event:', event);
      });
      
    // Also add a general listener to catch any event
    Echo.connector.pusher.connection.bind('message', (event) => {
      console.log('Raw pusher message:', event);
    });
    
    console.log("Channel setup complete for user:", user.id);
    console.log("Listening on channel:", `private-user.${user.id}`);
    
  } catch (error) {
    console.error('Failed to subscribe to channel:', error);
  }
  //Manager channel
  if(user.role === 'manager' || user.role === 'admin'){
try {
    ManagerChannel = Echo.private(`manager.notifications`)
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
        console.log("Leave data:", leaveData);       
        if (leaveData) {
            toast.info(`Employee ${leaveData.user_id} submitted a request from ${leaveData.start_date} to ${leaveData.end_date}.`
);
        }
        })
      // Also try listening with a dot notation (Laravel sometimes sends events this way)
      .listen(".RequestSubmitted", (event) => {
        console.log("Received event with dot notation:", event);
      })
      // Listen to all events on this channel for debugging
      .listenForWhisper('*', (event) => {
        console.log('Whisper event:', event);
      });
      
    // Also add a general listener to catch any event
    Echo.connector.pusher.connection.bind('message', (event) => {
      console.log('Raw pusher message:', event);
    });
    
    console.log("Listening on channel:", `private-manager.notifications`);
    
  } catch (error) {
    console.error('Failed to subscribe to channel:', error);
  }}
  return () => {
    if (channel) {
      console.log('Cleaning up Echo channel');
      try {
        Echo.leaveChannel(`private-user.${user.id}`);
      } catch (error) {
        console.error('Error leaving channel:', error);
      }
    }  
    if (ManagerChannel) {
      console.log('Cleaning up Echo channel');
      try {
        Echo.leaveChannel(`private-manager.notifications`);
      } catch (error) {
        console.error('Error leaving channel:', error);
      }
    }
  };
}, [user]);
  return (
    <>
      <Routes>
      <Route path='/login' element={<ProtectedRoute allowedRoles={[]}><Login /></ProtectedRoute>} />
      <Route path='/' element={<ProtectedRoute allowedRoles={["employee","admin","manager"]}><Dashboard /></ProtectedRoute>} />
      <Route path='/employee' element={<ProtectedRoute allowedRoles={["employee"]}><EmployeeDashboard/> </ProtectedRoute>}/>
      <Route path='/admin' element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard/></ProtectedRoute>}/>
      <Route path='/manager' element={<ProtectedRoute allowedRoles={["manager"]}><ManagerDashboard/></ProtectedRoute>}/>
      <Route path='/requestLeave' element={<ProtectedRoute allowedRoles={["employee"]}><RequestLeaveForm/></ProtectedRoute>}/>
      <Route path='/leaveTypes' element={<ProtectedRoute allowedRoles={["admin"]}><LeaveTypes/></ProtectedRoute>}/>
      <Route path='/myLeaveRequests' element={<ProtectedRoute allowedRoles={["employee"]}><MyLeaveRequests/></ProtectedRoute>}/>
      <Route path='/allLeaveRequests' element={<ProtectedRoute allowedRoles={["admin","manager"]}><AllLeaveRequests/></ProtectedRoute>}/>
      <Route path='/reports' element={<ProtectedRoute allowedRoles={["admin","manager"]}><ExportReports/></ProtectedRoute>}/>
      <Route path='/createUser' element={<ProtectedRoute allowedRoles={["admin"]}><CreateUser/></ProtectedRoute>}/>
    </Routes>
    <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App