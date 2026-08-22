import axiosClient from "../api/axiosClient";

export const getAllCareers = async (category = "") => {
  const response = await axiosClient.get(`/api/careers${category ? `?category=${category}` : ""}`);
  return response.data;
};

export const getCareerById = async (id) => {
  const response = await axiosClient.get(`/api/careers/${id}`);
  return response.data;
};

export const getCareerSkills = async (id) => {
  const response = await axiosClient.get(`/api/careers/${id}/skills`);
  return response.data;
};


export const getDiscoveryQuestions = async () => {
  const response = await axiosClient.get("/api/discovery/questions");
  return response.data;
};

export const submitDiscoveryAnswers = async (answers) => {
  // answers format: { questionId: selectedOptionIndex }
  const response = await axiosClient.post("/api/discovery/match", { answers });
  return response.data;
};
