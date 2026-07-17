import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../services/api';

function StatCard({ title, value, color, icon }) {
  const colorMap = {
    blue: 'border-blue-500 bg-blue-100 text-blue-600',
    green: 'border-green-500 bg-green-100 text-green-600',
    yellow: 'border-yellow-500 bg-yellow-100 text-yellow-600',
    red: 'border-red-500 bg-red-100 text-red-600',
    purple: 'border-purple-500 bg-purple-100 text-purple-600',
    indigo: 'border-indigo-500 bg-indigo-100 text-indigo-600',
  };
  const c = colorMap[color] || colorMap.blue;
  const iconBg = c.split(' ').find(s => s.startsWith('bg-'));
  const iconText = c.split(' ').find(s => s.startsWith('text-'));

  return (
    <div className={`bg-white rounded-xl shadow p-6 border-l-4 ${c.split(' ')[0]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`w-14 h-14 ${iconBg} rounded-full flex items-center justify-center`}>
          <svg className={`w-7 h-7 ${iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const colors = {
    admin: 'bg-red-100 text-red-700',
    doctor: 'bg-blue-100 text-blue-700',
    receptionist: 'bg-green-100 text-green-700',
    pharmacist: 'bg-purple-100 text-purple-700',
    patient: 'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[role] || 'bg-gray-100 text-gray-700'}`}>
      {role}
    </span>
  );
}

export default function Dashboard() {
  const { role, fullname } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const personIcon = 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z';
  const calendarIcon = 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';
  const userIcon = 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z';
  const pillIcon = 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Patients" value={stats?.totalPatients ?? 0} color="blue" icon={personIcon} />
        <StatCard title="Total Appointments" value={stats?.totalAppointments ?? 0} color="green" icon={calendarIcon} />
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} color="indigo" icon={userIcon} />
        <StatCard title="Total Prescriptions" value={stats?.totalPrescriptions ?? 0} color="purple" icon={pillIcon} />
        <StatCard title="Today's Appointments" value={stats?.todayAppointments ?? 0} color="yellow" icon={calendarIcon} />
        <StatCard title="Pending Appointments" value={stats?.pendingAppointments ?? 0} color="red" icon={calendarIcon} />
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Admin Overview</h2>
        <p className="text-gray-500">Manage your clinic&apos;s patients, appointments, users, and prescriptions from the sidebar.</p>
      </div>
    </>
  );

  const renderDoctorDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="My Patients" value={stats?.myPatients ?? 0} color="blue" icon={personIcon} />
        <StatCard title="Today's Appointments" value={stats?.todayAppointments ?? 0} color="green" icon={calendarIcon} />
        <StatCard title="Pending Prescriptions" value={stats?.pendingPrescriptions ?? 0} color="purple" icon={pillIcon} />
        <StatCard title="Completed Today" value={stats?.completedToday ?? 0} color="yellow" icon={calendarIcon} />
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Doctor Overview</h2>
        <p className="text-gray-500">View your patients, manage appointments, and create prescriptions.</p>
      </div>
    </>
  );

  const renderReceptionistDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Today's Appointments" value={stats?.todayAppointments ?? 0} color="green" icon={calendarIcon} />
        <StatCard title="Total Patients" value={stats?.totalPatients ?? 0} color="blue" icon={personIcon} />
        <StatCard title="New Bookings Today" value={stats?.newBookingsToday ?? 0} color="yellow" icon={calendarIcon} />
        <StatCard title="Pending Appointments" value={stats?.pendingAppointments ?? 0} color="red" icon={calendarIcon} />
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Receptionist Overview</h2>
        <p className="text-gray-500">Book appointments, manage patients, and track today&apos;s schedule.</p>
      </div>
    </>
  );

  const renderPharmacistDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Active Prescriptions" value={stats?.activePrescriptions ?? 0} color="purple" icon={pillIcon} />
        <StatCard title="Today's Prescriptions" value={stats?.todayPrescriptions ?? 0} color="green" icon={calendarIcon} />
        <StatCard title="Pending Review" value={stats?.pendingReview ?? 0} color="yellow" icon={pillIcon} />
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Pharmacist Overview</h2>
        <p className="text-gray-500">Review and update prescription statuses from the Prescriptions page.</p>
      </div>
    </>
  );

  const renderPatientDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Upcoming Appointments" value={stats?.upcomingAppointments ?? 0} color="green" icon={calendarIcon} />
        <StatCard title="My Prescriptions" value={stats?.myPrescriptions ?? 0} color="purple" icon={pillIcon} />
        <StatCard title="Completed Visits" value={stats?.completedVisits ?? 0} color="blue" icon={calendarIcon} />
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Welcome, {fullname || 'Patient'}</h2>
        <p className="text-gray-500">Book appointments, view your prescriptions, and check your medical history.</p>
      </div>
    </>
  );

  const dashboards = {
    admin: renderAdminDashboard,
    doctor: renderDoctorDashboard,
    receptionist: renderReceptionistDashboard,
    pharmacist: renderPharmacistDashboard,
    patient: renderPatientDashboard,
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, {fullname || 'User'} <RoleBadge role={role} />
          </p>
        </div>
      </div>
      {(dashboards[role] || renderAdminDashboard)()}
    </div>
  );
}
