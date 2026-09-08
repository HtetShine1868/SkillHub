import axiosClient from '../api/axiosClient'

export const getMyEnrollments = () =>
  axiosClient.get('/api/enrollments/my').then(r => r.data)

export const enrollInCourse = (courseId) =>
  axiosClient.post(`/api/enrollments/courses/${courseId}`).then(r => r.data)

export const completeLesson = (courseId, lessonId) =>
  axiosClient.post(`/api/enrollments/courses/${courseId}/lessons/${lessonId}/complete`).then(r => r.data)
