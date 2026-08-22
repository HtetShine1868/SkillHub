import axiosClient from "../api/axiosClient";

export const getAssessmentQuestions = async (careerId) => {
  const response = await axiosClient.get(`/api/assessments/questions?careerId=${careerId}`);
  return response.data;
};

export const submitAssessment = async (careerId, answers) => {
  // answers format: { questionId: answerValue }
  const response = await axiosClient.post("/api/assessments/submit", {
    careerId,
    answers
  });
  return response.data;
};
