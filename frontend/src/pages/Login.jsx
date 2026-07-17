import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin } from '../services/api';

const demoAccounts = [
  { username: 'admin', role: 'admin', label: 'Administrator', color: 'bg-red-100 text-red-700' },
  { username: 'dr.smith', role: 'doctor', label: 'Doctor', color: 'bg-blue-100 text-blue-700' },
  { username: 'reception', role: 'receptionist', label: 'Receptionist', color: 'bg-green-100 text-green-700' },
  { username: 'pharmacy', role: 'pharmacist', label: 'Pharmacist', color: 'bg-purple-100 text-purple-700' },
  { username: 'patient1', role: 'patient', label: 'Patient', color: 'bg-yellow-100 text-yellow-700' },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiLogin({ username, password });
      const d = res.data;
      login(d.token, d.username, d.role, d.fullname);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc) => {
    setUsername(acc.username);
    setPassword('admin123');
    setShowAccounts(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">ClinicCare</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Clinic Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm break-words">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm sm:text-base"
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm sm:text-base"
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={() => setShowAccounts(!showAccounts)}
            className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium transition"
          >
            {showAccounts ? 'Hide demo accounts' : 'Show demo accounts'}
          </button>
          {showAccounts && (
            <div className="mt-3 space-y-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.username}
                  onClick={() => fillDemo(acc)}
                  className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left"
                >
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-gray-800">{acc.username}</span>
                    <span className="text-xs text-gray-500 ml-2">{acc.label}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${acc.color}`}>
                    {acc.role}
                  </span>
                </button>
              ))}
              <p className="text-xs text-gray-400 text-center">Password for all: admin123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
