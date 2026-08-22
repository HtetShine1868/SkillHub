import axiosClient from "../api/axiosClient";

export const generateRoadmap = async (careerId) => {
  const response = await axiosClient.post(`/api/roadmap/generate?careerId=${careerId}`);
  return response.data;
};

export const getMyRoadmap = async (careerId) => {
  const response = await axiosClient.get(`/api/roadmap/my?careerId=${careerId}`);
  return response.data;
};
