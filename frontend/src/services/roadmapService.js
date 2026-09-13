import axiosClient from "../api/axiosClient";

export const generateRoadmap = async (careerId, confirm = false) => {
  const response = await axiosClient.post(`/api/roadmap/generate?careerId=${careerId}&confirm=${confirm}`);
  return response.data;
};

export const getMyRoadmap = async (careerId) => {
  const response = await axiosClient.get(`/api/roadmap/my?careerId=${careerId}`);
  return response.data;
};

export const listRoadmaps = async () => {
  const response = await axiosClient.get('/api/roadmap/all');
  return response.data;
};
