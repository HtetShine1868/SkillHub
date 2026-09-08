import axiosClient from '../api/axiosClient'

const courseCache = new Map()
const TTL = 120000 // 2 minutes

const getCached = async (key, fetcher) => {
  const cached = courseCache.get(key)
  if (cached && (Date.now() - cached.time < TTL)) {
    return cached.data
  }
  const data = await fetcher()
  courseCache.set(key, { data, time: Date.now() })
  return data
}

export const getAllCourses = (params = {}) => {
  const key = `courses_${JSON.stringify(params)}`
  return getCached(key, () => axiosClient.get('/api/courses', { params }).then(r => r.data))
}

export const getCourseById = (id) => {
  const key = `course_${id}`
  return getCached(key, () => axiosClient.get(`/api/courses/${id}`).then(r => r.data))
}

export const getLessons = (courseId) => {
  const key = `lessons_${courseId}`
  return getCached(key, () => axiosClient.get(`/api/courses/${courseId}/lessons`).then(r => r.data))
}

export const getLesson = (courseId, lessonId) => {
  const key = `lesson_${courseId}_${lessonId}`
  return getCached(key, () => axiosClient.get(`/api/courses/${courseId}/lessons/${lessonId}`).then(r => r.data))
}

export const clearCourseCache = () => {
  courseCache.clear()
}
