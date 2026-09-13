import axiosClient from '../api/axiosClient'

export async function getNotifications() {
  const { data } = await axiosClient.get('/api/notifications')
  return Array.isArray(data) ? data : []
}

export async function getUnreadNotificationCount() {
  const { data } = await axiosClient.get('/api/notifications/unread-count')
  return data?.count ?? 0
}

export async function markNotificationRead(id) {
  const { data } = await axiosClient.post(`/api/notifications/${id}/read`)
  return data
}

export async function markAllNotificationsRead() {
  const { data } = await axiosClient.post('/api/notifications/read-all')
  return data
}
