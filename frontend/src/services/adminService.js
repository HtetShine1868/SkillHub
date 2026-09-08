import axiosClient from '../api/axiosClient'

const API = '/api/admin'

// ── Stats ─────────────────────────────────────────────
export const getAdminStats = () =>
    axiosClient.get(`${API}/stats`).then(r => r.data)

// ── Careers ───────────────────────────────────────────
export const getAdminCareers = () =>
    axiosClient.get(`${API}/careers`).then(r => Array.isArray(r.data) ? r.data : [])

export const createCareer = (data) =>
    axiosClient.post(`${API}/careers`, data).then(r => r.data)

export const updateCareer = (id, data) =>
    axiosClient.put(`${API}/careers/${id}`, data).then(r => r.data)

export const deleteCareer = (id) =>
    axiosClient.delete(`${API}/careers/${id}`)

export const toggleCareerActive = (id) =>
    axiosClient.patch(`${API}/careers/${id}/toggle`).then(r => r.data)

// ── Career Skills ──────────────────────────────────────
export const getCareerSkills = (careerId) =>
    axiosClient.get(`${API}/careers/${careerId}/skills`).then(r => Array.isArray(r.data) ? r.data : [])

export const addCareerSkill = (careerId, data) =>
    axiosClient.post(`${API}/careers/${careerId}/skills`, data).then(r => r.data)

export const removeCareerSkill = (careerId, skillId) =>
    axiosClient.delete(`${API}/careers/${careerId}/skills/${skillId}`)

// ── Skills ────────────────────────────────────────────
export const getAdminSkills = () =>
    axiosClient.get(`${API}/skills`).then(r => Array.isArray(r.data) ? r.data : [])

export const createSkill = (data) =>
    axiosClient.post(`${API}/skills`, data).then(r => r.data)

export const updateSkill = (id, data) =>
    axiosClient.put(`${API}/skills/${id}`, data).then(r => r.data)

export const deleteSkill = (id) =>
    axiosClient.delete(`${API}/skills/${id}`)

// ── Discovery Questions ───────────────────────────────
export const getDiscoveryQuestions = () =>
    axiosClient.get(`${API}/discovery/questions`).then(r => Array.isArray(r.data) ? r.data : [])

export const createDiscoveryQuestion = (data) =>
    axiosClient.post(`${API}/discovery/questions`, data).then(r => r.data)

export const updateDiscoveryQuestion = (id, data) =>
    axiosClient.put(`${API}/discovery/questions/${id}`, data).then(r => r.data)

export const deleteDiscoveryQuestion = (id) =>
    axiosClient.delete(`${API}/discovery/questions/${id}`)

// ── Assessment Questions ──────────────────────────────
export const getAssessmentQuestions = () =>
    axiosClient.get(`${API}/assessment/questions`).then(r => Array.isArray(r.data) ? r.data : [])

export const createAssessmentQuestion = (data) =>
    axiosClient.post(`${API}/assessment/questions`, data).then(r => r.data)

export const updateAssessmentQuestion = (id, data) =>
    axiosClient.put(`${API}/assessment/questions/${id}`, data).then(r => r.data)

export const deleteAssessmentQuestion = (id) =>
    axiosClient.delete(`${API}/assessment/questions/${id}`)

// ── Courses ───────────────────────────────────────────
export const getAdminCourses = () =>
    axiosClient.get(`${API}/courses`).then(r => Array.isArray(r.data) ? r.data : [])

export const createAdminCourse = (data) =>
    axiosClient.post(`${API}/courses`, data).then(r => r.data)

export const updateAdminCourse = (id, data) =>
    axiosClient.put(`${API}/courses/${id}`, data).then(r => r.data)

export const deleteAdminCourse = (id) =>
    axiosClient.delete(`${API}/courses/${id}`)

export const toggleCoursePublished = (id) =>
    axiosClient.patch(`${API}/courses/${id}/toggle`).then(r => r.data)

export const approveAdminCourse = (id) =>
    axiosClient.post(`${API}/courses/${id}/approve`).then(r => r.data)

export const rejectAdminCourse = (id, reason) =>
    axiosClient.post(`${API}/courses/${id}/reject`, { reason }).then(r => r.data)

// ── Lessons ───────────────────────────────────────────
export const getAdminLessons = (courseId) =>
    axiosClient.get(`${API}/courses/${courseId}/lessons`).then(r => Array.isArray(r.data) ? r.data : [])

export const createAdminLesson = (courseId, data) =>
    axiosClient.post(`${API}/courses/${courseId}/lessons`, data).then(r => r.data)

export const updateAdminLesson = (courseId, lessonId, data) =>
    axiosClient.put(`${API}/courses/${courseId}/lessons/${lessonId}`, data).then(r => r.data)

export const deleteAdminLesson = (courseId, lessonId) =>
    axiosClient.delete(`${API}/courses/${courseId}/lessons/${lessonId}`)

