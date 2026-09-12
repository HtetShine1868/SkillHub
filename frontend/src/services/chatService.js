import axiosClient from '../api/axiosClient'

const cache = new Map()
const inflight = new Map()
const TTL = 20000

const getCached = async (key, fetcher, ttl = TTL) => {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.time < ttl) {
    return hit.data
  }
  if (inflight.has(key)) {
    return inflight.get(key)
  }
  const promise = fetcher()
    .then((data) => {
      cache.set(key, { data, time: Date.now() })
      inflight.delete(key)
      return data
    })
    .catch((err) => {
      inflight.delete(key)
      throw err
    })
  inflight.set(key, promise)
  return promise
}

export const getConversations = () =>
  getCached('conversations', () => axiosClient.get('/api/chat/conversations').then(r => r.data || []))

export const getAvailableInstructors = () =>
  getCached('instructors', () => axiosClient.get('/api/chat/available-instructors').then(r => r.data || []))

export const getChatMessages = (params) =>
  axiosClient.get('/api/chat/messages', { params }).then(r => r.data || [])

export const sendChatMessage = (payload) =>
  axiosClient.post('/api/chat/messages', payload).then(r => r.data)

export const peekConversations = () => cache.get('conversations')?.data || null

export const invalidateChatCache = () => {
  cache.delete('conversations')
  cache.delete('instructors')
}
