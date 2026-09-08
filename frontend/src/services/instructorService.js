import axiosClient from '../api/axiosClient'

export const getInstructorStats = async () => {
  const res = await axiosClient.get('/api/instructor/stats')
  return res.data
}

export const getInstructorCourses = async () => {
  const res = await axiosClient.get('/api/instructor/courses')
  return Array.isArray(res.data) ? res.data : []
}

export const getInstructorCourseById = async (id) => {
  const res = await axiosClient.get(`/api/instructor/courses/${id}`)
  return res.data
}

export const createInstructorCourse = async (data) => {
  const res = await axiosClient.post('/api/instructor/courses', data)
  return res.data
}

export const updateInstructorCourse = async (id, data) => {
  const res = await axiosClient.put(`/api/instructor/courses/${id}`, data)
  return res.data
}

export const submitCourseForApproval = async (id) => {
  const res = await axiosClient.post(`/api/instructor/courses/${id}/submit`)
  return res.data
}

export const deleteInstructorCourse = async (id) => {
  await axiosClient.delete(`/api/instructor/courses/${id}`)
  return true
}
