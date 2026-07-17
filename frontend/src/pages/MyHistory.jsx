import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPatientHistory } from '../services/api';

export default function MyHistory() {
  const { username } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const payload = JSON.parse(atob(token.split('.')[1]));
        const res = await getPatientHistory(payload.id);
        setHistory(res.data);
      } catch {
        // error handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm sm:text-lg">Loading history...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">My Medical History</h1>

      {history.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 sm:p-8 text-center">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400 text-base sm:text-lg">No medical history found</p>
          <p className="text-gray-300 text-xs sm:text-sm mt-1">Your past appointments and visits will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {history.map((item, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{item.reason || item.type || 'Visit'}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {item.appointment_date || item.date || item.created_at}
                  </p>
                  {item.doctor_name && (
                    <p className="text-xs sm:text-sm text-gray-500">Doctor: {item.doctor_name}</p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full self-start flex-shrink-0 ${item.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {item.status || 'N/A'}
                </span>
              </div>
              {item.notes && (
                <p className="text-xs sm:text-sm text-gray-600 mt-3 border-t pt-3 break-words">{item.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
