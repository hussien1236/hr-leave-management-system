import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export function AuthProvider({children}) {
  const [user,setUser] = useState(() => {
    const cached = localStorage.getItem('user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  const login = async (email,password) => {
    const res = await api.post('login',{email,password});
    localStorage.setItem('token', res.data.access_token);
    api.defaults.headers.common.Authorization = `Bearer ${res.data.access_token}`;
    const me = await api.get('/me');
    setUser(me.data);
    localStorage.setItem('user', JSON.stringify(me.data));
    return me.data;
  };

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    delete api.defaults.headers.common.Authorization;
  };

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      try {
        const {data} = await api.get('/me');
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        console.log('data: ',data);
      } catch { 
        await logout(); 
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return <AuthContext.Provider value={{user,loading,login,logout}}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);