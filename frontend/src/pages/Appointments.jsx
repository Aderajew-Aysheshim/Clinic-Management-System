import { useEffect, useState } from 'react';
import { getAppointments, getPatients, createAppointment, updateAppointment, deleteAppointment } from '../services/api';

export default function Appointments() {
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
      await createAppointment({ ...form, patient_id: parseInt(form.patient_id) });
      setShowModal(false);
      setForm({ patient_id: '', appointment_date: '', reason: '' });
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.error || 'Error booking appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateAppointment(id, { status });
      fetchAppointments();
    } catch {
      alert('Error updating appointment');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await deleteAppointment(id);
      fetchAppointments();
    } catch {
      alert('Error deleting appointment');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Completed') {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Completed</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Pending</span>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
          + Book Appointment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No appointments found</td></tr>
            ) : (
              appointments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.patient_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(a.appointment_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.reason}</td>
                  <td className="px-6 py-4">{getStatusBadge(a.status)}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    {a.status === 'Pending' && (
                      <>
                        <button onClick={() => handleStatus(a.id, 'Completed')} className="text-green-600 hover:text-green-800 mr-3 font-medium">Complete</button>
                        <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-800 font-medium">Cancel</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Book Appointment</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <select value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required>
                    <option value="">Select Patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.fullname}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" rows={3} required placeholder="e.g. Annual checkup, Follow-up visit" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
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
