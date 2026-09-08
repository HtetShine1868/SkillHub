import axiosClient from "../api/axiosClient";

const careerCache = new Map();
const TTL = 120000; // 2 minutes

const getCached = async (key, fetcher) => {
  const cached = careerCache.get(key);
  if (cached && (Date.now() - cached.time < TTL)) {
    return cached.data;
  }
  const data = await fetcher();
  careerCache.set(key, { data, time: Date.now() });
  return data;
};

export const getAllCareers = async (category = "") => {
  const key = `careers_${category}`;
  return getCached(key, async () => {
    const response = await axiosClient.get(`/api/careers${category ? `?category=${category}` : ""}`);
    return response.data;
  });
};

export const getCareerById = async (id) => {
  const key = `career_${id}`;
  return getCached(key, async () => {
    const response = await axiosClient.get(`/api/careers/${id}`);
    return response.data;
  });
};

export const getCareerSkills = async (id) => {
  const key = `career_skills_${id}`;
  return getCached(key, async () => {
    const response = await axiosClient.get(`/api/careers/${id}/skills`);
    return response.data;
  });
};

export const getDiscoveryQuestions = async () => {
  const key = 'discovery_questions';
  return getCached(key, async () => {
    const response = await axiosClient.get("/api/discovery/questions");
    return response.data;
  });
};

export const submitDiscoveryAnswers = async (answers) => {
  const response = await axiosClient.post("/api/discovery/match", { answers });
  return response.data;
};

export const clearCareerCache = () => {
  careerCache.clear();
};
