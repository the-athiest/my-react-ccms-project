import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getComplaints = async (params = {}) => {
  const response = await api.get('/complaints', { params });
  return response.data;
};

export const getComplaintById = async (id) => {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
};

export const createComplaint = async (complaintData) => {
  const response = await api.post('/complaints', complaintData);
  return response.data;
};

// Hard constraint: Use PUT, never PATCH
export const updateComplaint = async (id, updatedComplaintData) => {
  const response = await api.put(`/complaints/${id}`, updatedComplaintData);
  return response.data;
};

export default api;
