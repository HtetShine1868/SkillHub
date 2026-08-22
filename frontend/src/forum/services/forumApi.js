// ============================================================
// SKILLHUB FORUM — API SERVICE LAYER
// Currently backed by mock data.
// To connect to the Spring Boot backend, replace mock imports
// with axios calls to your API base URL.
// ============================================================

import {
  MOCK_PROJECTS,
  MOCK_JOIN_REQUESTS,
  MOCK_CURRENT_USER,
} from '../data/forumData'

// ------------------------------------------------------------
// CONFIG — change BASE_URL when backend is ready
// ------------------------------------------------------------
// const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Simulate async network delay
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms))

// In-memory store (replaces backend state for mock mode)
let _projects = [...MOCK_PROJECTS]
let _requests = [...MOCK_JOIN_REQUESTS]

// ------------------------------------------------------------
// PROJECTS
// ------------------------------------------------------------

/**
 * Fetch all projects with optional filters.
 * @param {{ category?: string, level?: string, status?: string, search?: string, sort?: string }} filters
 */
export async function getProjects(filters = {}) {
  await delay()
  let results = [..._projects]

  if (filters.category && filters.category !== 'All') {
    results = results.filter((p) => p.category === filters.category)
  }
  if (filters.level) {
    results = results.filter((p) => p.level === filters.level)
  }
  if (filters.status) {
    results = results.filter((p) => p.status === filters.status)
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q)) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    )
  }

  // Sorting
  switch (filters.sort) {
    case 'Most Popular':
      results.sort((a, b) => b.currentMembers - a.currentMembers)
      break
    case 'Most Needed':
      results.sort(
        (a, b) =>
          b.maxMembers - b.currentMembers - (a.maxMembers - a.currentMembers)
      )
      break
    case 'Almost Full':
      results.sort(
        (a, b) =>
          b.currentMembers / b.maxMembers - a.currentMembers / a.maxMembers
      )
      break
    case 'Newest':
    default:
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
  }

  return results
}

/**
 * Fetch a single project by ID.
 * @param {string} id
 */
export async function getProjectById(id) {
  await delay()
  const project = _projects.find((p) => p.id === id)
  if (!project) throw new Error(`Project with id "${id}" not found`)
  return { ...project }
}

/**
 * Create a new project.
 * @param {object} data
 */
export async function createProject(data) {
  await delay(500)
  const newProject = {
    id: String(Date.now()),
    ...data,
    currentMembers: 1,
    status: 'Recruiting',
    owner: MOCK_CURRENT_USER,
    members: [{ ...MOCK_CURRENT_USER, role: 'Owner' }],
    goals: [],
    discussion: [],
    pendingRequests: 0,
    userStatus: 'owner',
    createdAt: new Date().toISOString(),
  }
  _projects = [newProject, ..._projects]
  return newProject
}

/**
 * Update an existing project.
 * @param {string} id
 * @param {object} data
 */
export async function updateProject(id, data) {
  await delay(400)
  _projects = _projects.map((p) => (p.id === id ? { ...p, ...data } : p))
  return _projects.find((p) => p.id === id)
}

/**
 * Get projects belonging to the current user (owner or member).
 */
export async function getMyProjects() {
  await delay()
  const owned = _projects.filter(
    (p) => p.owner.id === MOCK_CURRENT_USER.id
  )
  const joined = _projects.filter(
    (p) =>
      p.owner.id !== MOCK_CURRENT_USER.id &&
      p.members.some((m) => m.id === MOCK_CURRENT_USER.id)
  )
  return { owned, joined }
}

// ------------------------------------------------------------
// JOIN REQUESTS
// ------------------------------------------------------------

/**
 * Send a join request for a project.
 * @param {string} projectId
 * @param {{ message: string, skills: string[] }} data
 */
export async function sendJoinRequest(projectId, data) {
  await delay(500)
  const newRequest = {
    id: `r${Date.now()}`,
    projectId,
    applicant: MOCK_CURRENT_USER,
    skills: data.skills || MOCK_CURRENT_USER.skills,
    level: MOCK_CURRENT_USER.level,
    message: data.message,
    date: new Date().toISOString(),
    status: 'pending',
  }
  _requests = [newRequest, ..._requests]

  // Mark user status as pending
  _projects = _projects.map((p) =>
    p.id === projectId
      ? { ...p, userStatus: 'pending', pendingRequests: (p.pendingRequests || 0) + 1 }
      : p
  )

  return newRequest
}

/**
 * Get all join requests for a project (owner only).
 * @param {string} projectId
 */
export async function getJoinRequests(projectId) {
  await delay()
  return _requests.filter(
    (r) => r.projectId === projectId && r.status === 'pending'
  )
}

/**
 * Get pending requests made by current user.
 */
export async function getMyPendingRequests() {
  await delay()
  return _requests
    .filter((r) => r.applicant.id === MOCK_CURRENT_USER.id && r.status === 'pending')
    .map((r) => {
      const project = _projects.find((p) => p.id === r.projectId)
      return { ...r, project }
    })
}

/**
 * Approve a join request.
 * @param {string} projectId
 * @param {string} requestId
 */
export async function approveJoinRequest(projectId, requestId) {
  await delay(400)
  const request = _requests.find((r) => r.id === requestId)
  if (!request) throw new Error('Request not found')

  _requests = _requests.map((r) =>
    r.id === requestId ? { ...r, status: 'approved' } : r
  )

  _projects = _projects.map((p) => {
    if (p.id !== projectId) return p
    const newMember = {
      ...request.applicant,
      role: 'Member',
    }
    const newCount = p.currentMembers + 1
    return {
      ...p,
      members: [...p.members, newMember],
      currentMembers: newCount,
      pendingRequests: Math.max(0, (p.pendingRequests || 1) - 1),
      status: newCount >= p.maxMembers ? 'Full' : p.status,
    }
  })

  return { success: true }
}

/**
 * Reject a join request.
 * @param {string} projectId
 * @param {string} requestId
 */
export async function rejectJoinRequest(projectId, requestId) {
  await delay(400)
  _requests = _requests.map((r) =>
    r.id === requestId ? { ...r, status: 'rejected' } : r
  )
  _projects = _projects.map((p) =>
    p.id === projectId
      ? { ...p, pendingRequests: Math.max(0, (p.pendingRequests || 1) - 1) }
      : p
  )
  return { success: true }
}

/**
 * Add a discussion comment to a project.
 * @param {string} projectId
 * @param {string} text
 * @param {string|null} parentId  - if replying to a comment
 */
export async function addComment(projectId, text, parentId = null) {
  await delay(300)
  const newComment = {
    id: `d${Date.now()}`,
    author: MOCK_CURRENT_USER,
    text,
    timestamp: new Date().toISOString(),
    likes: 0,
    replies: [],
  }

  _projects = _projects.map((p) => {
    if (p.id !== projectId) return p
    if (!parentId) {
      return { ...p, discussion: [...p.discussion, newComment] }
    }
    const updatedDiscussion = p.discussion.map((c) =>
      c.id === parentId
        ? { ...c, replies: [...c.replies, newComment] }
        : c
    )
    return { ...p, discussion: updatedDiscussion }
  })

  return newComment
}

/**
 * Toggle like on a comment.
 */
export async function toggleCommentLike(projectId, commentId) {
  await delay(100)
  _projects = _projects.map((p) => {
    if (p.id !== projectId) return p
    const updatedDiscussion = p.discussion.map((c) => {
      if (c.id === commentId) return { ...c, likes: c.likes + 1 }
      const updatedReplies = c.replies.map((r) =>
        r.id === commentId ? { ...r, likes: r.likes + 1 } : r
      )
      return { ...c, replies: updatedReplies }
    })
    return { ...p, discussion: updatedDiscussion }
  })
  return { success: true }
}
