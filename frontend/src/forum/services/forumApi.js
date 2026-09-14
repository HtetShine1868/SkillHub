// ============================================================
// SKILLHUB FORUM — API SERVICE LAYER
// Backed by the Spring Boot backend via axiosClient.
// All endpoints require authentication (JWT cookie).
// ============================================================

import axiosClient from '../../api/axiosClient'

const BASE = '/api/skill-exchange/projects'

// ------------------------------------------------------------
// PROJECTS
// ------------------------------------------------------------

/**
 * Fetch all projects with optional filters.
 * @param {{ category?: string, level?: string, status?: string, search?: string, sort?: string }} filters
 */
export async function getProjects(filters = {}) {
  const params = {}
  if (filters.category && filters.category !== 'All') params.category = filters.category
  if (filters.level) params.level = filters.level
  if (filters.status) params.status = filters.status
  if (filters.search) params.search = filters.search
  if (filters.sort) params.sort = filters.sort

  const { data } = await axiosClient.get(BASE, { params })
  return data
}

/**
 * Fetch a single project by ID.
 * @param {string|number} id
 */
export async function getProjectById(id) {
  const { data } = await axiosClient.get(`${BASE}/${id}`)
  return data
}

/**
 * Catalog skills for project requirements (select, not free text).
 */
export async function getCatalogSkills() {
  const { data } = await axiosClient.get('/api/skills')
  return Array.isArray(data) ? data : []
}

/**
 * Create a new project.
 * @param {object} projectData
 */
export async function createProject(projectData) {
  const { data } = await axiosClient.post(BASE, projectData)
  return data
}

/**
 * Get projects belonging to the current user (owner or member).
 */
export async function getMyProjects() {
  const { data } = await axiosClient.get(`${BASE}/my`)
  return data  // { owned: [...], joined: [...] }
}

// ------------------------------------------------------------
// JOIN REQUESTS
// ------------------------------------------------------------

/**
 * Send a join request for a project.
 * @param {string|number} projectId
 * @param {{ message: string, skills: string[], requestedRole?: string }} requestData
 */
export async function sendJoinRequest(projectId, requestData) {
  const { data } = await axiosClient.post(`${BASE}/${projectId}/apply`, requestData)
  return data
}

/**
 * Get all join requests for a project (owner only).
 * @param {string|number} projectId
 */
export async function getJoinRequests(projectId) {
  const { data } = await axiosClient.get(`${BASE}/${projectId}/requests`)
  return data
}

/**
 * Get pending requests made by current user.
 */
export async function getMyPendingRequests() {
  const { data } = await axiosClient.get(`${BASE}/my-requests`)
  return data
}

/**
 * Approve a join request.
 * @param {string|number} projectId
 * @param {string|number} requestId
 */
export async function approveJoinRequest(projectId, requestId) {
  const { data } = await axiosClient.post(`${BASE}/${projectId}/requests/${requestId}/approve`)
  return data
}

/**
 * Reject a join request.
 * @param {string|number} projectId
 * @param {string|number} requestId
 */
export async function rejectJoinRequest(projectId, requestId) {
  const { data } = await axiosClient.post(`${BASE}/${projectId}/requests/${requestId}/reject`)
  return data
}

// ------------------------------------------------------------
// DISCUSSION / COMMENTS
// ------------------------------------------------------------

/**
 * Add a discussion comment to a project.
 * @param {string|number} projectId
 * @param {string} text
 * @param {string|number|null} parentId  - if replying to a comment
 */
export async function addComment(projectId, text, parentId = null) {
  const params = parentId ? { parentId } : {}
  const { data } = await axiosClient.post(`${BASE}/${projectId}/comments`, { text }, { params })
  return data
}

/**
 * Toggle like on a comment.
 * @param {string|number} projectId
 * @param {string|number} commentId
 */
export async function toggleCommentLike(projectId, commentId) {
  const { data } = await axiosClient.post(`${BASE}/${projectId}/comments/${commentId}/like`)
  return data
}

/**
 * Replace the project's goal list (owner only).
 * @param {string|number} projectId
 * @param {{ id?: string, text: string, done: boolean }[]} goals
 */
export async function updateProjectGoals(projectId, goals) {
  const { data } = await axiosClient.put(`${BASE}/${projectId}/goals`, { goals })
  return data
}

/**
 * Toggle a goal as done / not done (members and owner).
 * @param {string|number} projectId
 * @param {string} goalId
 * @param {boolean} [done]
 */
export async function toggleProjectGoal(projectId, goalId, done) {
  const { data } = await axiosClient.patch(
    `${BASE}/${projectId}/goals/${encodeURIComponent(goalId)}`,
    done === undefined ? {} : { done }
  )
  return data
}
