import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
 const { user } = useAuth();
    const nav = useNavigate();
 useEffect(() => {   
    if(user && user.role){
        console.log('user role: ',user.role);
 if (user.role === 'admin') nav('/admin');
        else if (user.role === 'manager') nav('/manager');
        else nav('/employee');
    }
    },[]);
}

export default Dashboard