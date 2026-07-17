import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [fullname, setFullname] = useState(localStorage.getItem('fullname'));

  const login = (newToken, newUsername, newRole, newFullname) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
    localStorage.setItem('role', newRole);
    localStorage.setItem('fullname', newFullname);
    setToken(newToken);
    setUsername(newUsername);
    setRole(newRole);
    setFullname(newFullname);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('fullname');
    setToken(null);
    setUsername(null);
    setRole(null);
    setFullname(null);
  };

  return (
    <AuthContext.Provider value={{ token, username, role, fullname, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
