import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPrescriptions, createPrescription, updatePrescription, getPatients } from '../services/api';

const statusColors = {
  Active: 'bg-green-100 text-green-700',
  Completed: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-700',
  Pending: 'bg-yellow-100 text-yellow-700',
};

export default function Prescriptions() {
  const { role } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient_id: '', medication: '', dosage: '', frequency: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const canCreate = role === 'doctor' || role === 'admin';
  const canUpdateStatus = role === 'pharmacist' || role === 'admin';

  const fetchPrescriptions = async () => {
    try {
      const res = await getPrescriptions();
      setPrescriptions(res.data);
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
    fetchPrescriptions();
    if (canCreate) fetchPatients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPrescription({ ...form, patient_id: parseInt(form.patient_id) });
      setShowModal(false);
      setForm({ patient_id: '', medication: '', dosage: '', frequency: '', notes: '' });
      fetchPrescriptions();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updatePrescription(id, { status });
      fetchPrescriptions();
    } catch {
      alert('Error updating prescription');
    }
  };

  const filtered = prescriptions.filter((p) =>
    p.medication?.toLowerCase().includes(search.toLowerCase()) ||
    p.patient_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Prescriptions</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="text"
            placeholder="Search prescriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm w-full sm:w-auto"
          />
          {canCreate && (
            <button onClick={() => { setForm({ patient_id: '', medication: '', dosage: '', frequency: '', notes: '' }); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm whitespace-nowrap">
              + New
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medication</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Dosage</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Frequency</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                {canUpdateStatus && (
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr><td colSpan={canUpdateStatus ? 6 : 5} className="px-6 py-12 text-center text-gray-400">No prescriptions found</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900">{p.patient_name}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">{p.medication}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-600 hidden sm:table-cell">{p.dosage}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-600 hidden md:table-cell">{p.frequency}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${statusColors[p.status] || statusColors.Pending}`}>{p.status || 'Pending'}</span>
                    </td>
                    {canUpdateStatus && (
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-sm">
                        {p.status !== 'Completed' && p.status !== 'Cancelled' && (
                          <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
                            <button onClick={() => handleStatus(p.id, 'Active')} className="text-green-600 hover:text-green-800 font-medium px-1 text-xs sm:text-sm">Active</button>
                            <button onClick={() => handleStatus(p.id, 'Completed')} className="text-blue-600 hover:text-blue-800 font-medium px-1 text-xs sm:text-sm">Done</button>
                            <button onClick={() => handleStatus(p.id, 'Cancelled')} className="text-red-600 hover:text-red-800 font-medium px-1 text-xs sm:text-sm">Cancel</button>
                          </div>
                        )}
                      </td>
                    )}
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
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">New Prescription</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <select value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" required>
                    <option value="">Select Patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.fullname}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
                  <input type="text" value={form.medication} onChange={(e) => setForm({ ...form, medication: e.target.value })} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" required placeholder="e.g. Amoxicillin" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                    <input type="text" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" required placeholder="e.g. 500mg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <input type="text" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" required placeholder="e.g. 3x daily" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" rows={2} placeholder="Optional notes" />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-5 sm:mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
