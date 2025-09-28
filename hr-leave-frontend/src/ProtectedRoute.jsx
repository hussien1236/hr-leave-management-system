import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const nav = useNavigate();
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  useEffect(()=>{

    if (!user) {
      nav('/login');
      return;
    }
  
    if (!allowedRoles.includes(user.role)) {
      nav('/unauthorized');
      return;
    }
  },[user, nav, allowedRoles])

  return children;
};

export default ProtectedRoute;