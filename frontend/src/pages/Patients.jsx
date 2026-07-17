import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPatients, createPatient, updatePatient, deletePatient, getPatientHistory } from '../services/api';

export default function Patients() {
  const { role } = useAuth();
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ fullname: '', gender: 'Male', age: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [historyModal, setHistoryModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyPatient, setHistoryPatient] = useState('');

  const canCreate = role === 'admin' || role === 'receptionist';
  const canEdit = role === 'admin' || role === 'receptionist';
  const canDelete = role === 'admin';

  const fetchPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data);
    } catch {
      // error handled silently
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setForm({ fullname: '', gender: 'Male', age: '', phone: '', address: '' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({ fullname: p.fullname, gender: p.gender, age: p.age, phone: p.phone, address: p.address || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, age: parseInt(form.age) };
      if (editId) {
        await updatePatient(editId, payload);
      } else {
        await createPatient(payload);
      }
      setShowModal(false);
      fetchPatients();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving patient');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    try {
      await deletePatient(id);
      fetchPatients();
    } catch {
      alert('Error deleting patient');
    }
  };

  const viewHistory = async (p) => {
    try {
      const res = await getPatientHistory(p.id || p.user_id);
      setHistory(res.data);
      setHistoryPatient(p.fullname);
      setHistoryModal(true);
    } catch {
      alert('Could not load patient history');
    }
  };

  const filtered = patients.filter((p) =>
    p.fullname?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Patients</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm w-full sm:w-auto"
          />
          {canCreate && (
            <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm whitespace-nowrap">
              + Add Patient
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Gender</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Address</th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No patients found</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900">
                      <div>{p.fullname}</div>
                      <div className="text-xs text-gray-500 sm:hidden mt-0.5">{p.gender}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-600 hidden sm:table-cell">{p.gender}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">{p.age}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">{p.phone}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-600 hidden md:table-cell">{p.address}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-sm">
                      <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
                        <button onClick={() => viewHistory(p)} className="text-gray-600 hover:text-gray-800 font-medium px-1">History</button>
                        {canEdit && (
                          <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-800 font-medium px-1">Edit</button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 font-medium px-1">Del</button>
                        )}
                      </div>
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
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">{editId ? 'Edit Patient' : 'Add Patient'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" required min="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" required />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-5 sm:mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate pr-4">History: {historyPatient}</h2>
              <button onClick={() => setHistoryModal(false)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No history found</p>
            ) : (
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800">{h.reason || h.type || 'Visit'}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{h.appointment_date || h.date || h.created_at}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full self-start flex-shrink-0 ${h.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {h.status || 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
