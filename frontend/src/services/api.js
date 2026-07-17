import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      localStorage.removeItem('fullname');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = (data) => API.post('/auth/login', data);

export const getDashboard = () => API.get('/patients/dashboard');

export const getPatients = () => API.get('/patients');
export const getPatient = (id) => API.get(`/patients/${id}`);
export const createPatient = (data) => API.post('/patients', data);
export const updatePatient = (id, data) => API.put(`/patients/${id}`, data);
export const deletePatient = (id) => API.delete(`/patients/${id}`);
export const getPatientHistory = (userId) => API.get(`/patients/history/${userId}`);

export const getAppointments = () => API.get('/appointments');
export const createAppointment = (data) => API.post('/appointments', data);
export const updateAppointment = (id, data) => API.put(`/appointments/${id}`, data);
export const deleteAppointment = (id) => API.delete(`/appointments/${id}`);

export const getUsers = () => API.get('/users');
export const createUser = (data) => API.post('/users', data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);

export const getPrescriptions = () => API.get('/prescriptions');
export const createPrescription = (data) => API.post('/prescriptions', data);
export const updatePrescription = (id, data) => API.put(`/prescriptions/${id}`, data);
export const getPrescriptionsByPatient = (id) => API.get(`/prescriptions/patient/${id}`);

export default API;
