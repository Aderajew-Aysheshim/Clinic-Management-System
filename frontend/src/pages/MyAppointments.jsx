import { useEffect, useState } from 'react';
import { getAppointments, createAppointment, deleteAppointment, getPatients } from '../services/api';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient_id: '', appointment_date: '', reason: '' });
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await getAppointments();
      setAppointments(res.data);
    } catch {
      // error handled silently
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data);
    } catch {
      // error handled silently
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (form.patient_id) payload.patient_id = parseInt(form.patient_id);
      await createAppointment(payload);
      setShowModal(false);
      setForm({ patient_id: '', appointment_date: '', reason: '' });
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.error || 'Error booking appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await deleteAppointment(id);
      fetchAppointments();
    } catch {
      alert('Error cancelling appointment');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Completed: 'bg-green-100 text-green-700',
      Cancelled: 'bg-red-100 text-red-700',
      'In Progress': 'bg-blue-100 text-blue-700',
      Pending: 'bg-yellow-100 text-yellow-700',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${styles[status] || styles.Pending}`}>{status || 'Pending'}</span>;
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">My Appointments</h1>
        <button onClick={() => { setForm({ patient_id: '', appointment_date: '', reason: '' }); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm whitespace-nowrap">
          + Book Appointment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Reason</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {appointments.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">No appointments found</td></tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">
                      <div className="whitespace-nowrap">{new Date(a.appointment_date).toLocaleString()}</div>
                      <div className="text-xs text-gray-500 sm:hidden mt-0.5 truncate max-w-[150px]">{a.reason}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-600 hidden sm:table-cell">{a.reason}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">{getStatusBadge(a.status)}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-sm">
                      {a.status === 'Pending' && (
                        <button onClick={() => handleCancel(a.id)} className="text-red-600 hover:text-red-800 font-medium">Cancel</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Book Appointment</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <input type="datetime-local" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" rows={3} required placeholder="e.g. Annual checkup, Follow-up visit" />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-5 sm:mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">
                  {loading ? 'Booking...' : 'Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
