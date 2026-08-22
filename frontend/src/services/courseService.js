import axiosClient from '../api/axiosClient'

export const getAllCourses = (params = {}) =>
  axiosClient.get('/api/courses', { params }).then(r => r.data)

export const getCourseById = (id) =>
  axiosClient.get(`/api/courses/${id}`).then(r => r.data)

export const getLessons = (courseId) =>
  axiosClient.get(`/api/courses/${courseId}/lessons`).then(r => r.data)

export const getLesson = (courseId, lessonId) =>
  axiosClient.get(`/api/courses/${courseId}/lessons/${lessonId}`).then(r => r.data)
