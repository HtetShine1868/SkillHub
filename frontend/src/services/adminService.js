import axios from 'axios'

const API = '/api/admin'

// ── Stats ─────────────────────────────────────────────
export const getAdminStats = () =>
    axios.get(`${API}/stats`).then(r => r.data)

// ── Careers ───────────────────────────────────────────
export const getAdminCareers = () =>
    axios.get(`${API}/careers`).then(r => r.data)

export const createCareer = (data) =>
    axios.post(`${API}/careers`, data).then(r => r.data)

export const updateCareer = (id, data) =>
    axios.put(`${API}/careers/${id}`, data).then(r => r.data)

export const deleteCareer = (id) =>
    axios.delete(`${API}/careers/${id}`)

export const toggleCareerActive = (id) =>
    axios.patch(`${API}/careers/${id}/toggle`).then(r => r.data)

// ── Career Skills ──────────────────────────────────────
export const getCareerSkills = (careerId) =>
    axios.get(`${API}/careers/${careerId}/skills`).then(r => r.data)

export const addCareerSkill = (careerId, data) =>
    axios.post(`${API}/careers/${careerId}/skills`, data).then(r => r.data)

export const removeCareerSkill = (careerId, skillId) =>
    axios.delete(`${API}/careers/${careerId}/skills/${skillId}`)

// ── Skills ────────────────────────────────────────────
export const getAdminSkills = () =>
    axios.get(`${API}/skills`).then(r => r.data)

export const createSkill = (data) =>
    axios.post(`${API}/skills`, data).then(r => r.data)

export const updateSkill = (id, data) =>
    axios.put(`${API}/skills/${id}`, data).then(r => r.data)

export const deleteSkill = (id) =>
    axios.delete(`${API}/skills/${id}`)

// ── Discovery Questions ───────────────────────────────
export const getDiscoveryQuestions = () =>
    axios.get(`${API}/discovery/questions`).then(r => r.data)

export const createDiscoveryQuestion = (data) =>
    axios.post(`${API}/discovery/questions`, data).then(r => r.data)

export const updateDiscoveryQuestion = (id, data) =>
    axios.put(`${API}/discovery/questions/${id}`, data).then(r => r.data)

export const deleteDiscoveryQuestion = (id) =>
    axios.delete(`${API}/discovery/questions/${id}`)

// ── Assessment Questions ──────────────────────────────
export const getAssessmentQuestions = () =>
    axios.get(`${API}/assessment/questions`).then(r => r.data)

export const createAssessmentQuestion = (data) =>
    axios.post(`${API}/assessment/questions`, data).then(r => r.data)

export const updateAssessmentQuestion = (id, data) =>
    axios.put(`${API}/assessment/questions/${id}`, data).then(r => r.data)

export const deleteAssessmentQuestion = (id) =>
    axios.delete(`${API}/assessment/questions/${id}`)

// ── Courses ───────────────────────────────────────────
export const getAdminCourses = () =>
    axios.get(`${API}/courses`).then(r => r.data)

export const createAdminCourse = (data) =>
    axios.post(`${API}/courses`, data).then(r => r.data)

export const updateAdminCourse = (id, data) =>
    axios.put(`${API}/courses/${id}`, data).then(r => r.data)

export const deleteAdminCourse = (id) =>
    axios.delete(`${API}/courses/${id}`)

export const toggleCoursePublished = (id) =>
    axios.patch(`${API}/courses/${id}/toggle`).then(r => r.data)

// ── Lessons ───────────────────────────────────────────
export const getAdminLessons = (courseId) =>
    axios.get(`${API}/courses/${courseId}/lessons`).then(r => r.data)

export const createAdminLesson = (courseId, data) =>
    axios.post(`${API}/courses/${courseId}/lessons`, data).then(r => r.data)

export const updateAdminLesson = (courseId, lessonId, data) =>
    axios.put(`${API}/courses/${courseId}/lessons/${lessonId}`, data).then(r => r.data)

export const deleteAdminLesson = (courseId, lessonId) =>
    axios.delete(`${API}/courses/${courseId}/lessons/${lessonId}`)
