import { useState, useEffect } from 'react'
import axiosClient from '../../api/axiosClient'
import './AdminUsersPage.css'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get(`/api/admin/users?role=${roleFilter}`)
      setUsers(Array.isArray(res.data) ? res.data : [])
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [roleFilter])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleToggleStatus = async (user) => {
    try {
      const res = await axiosClient.patch(`/api/admin/users/${user.id}/toggle`)
      const updatedUser = res.data
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u))
      showToast(`User ${updatedUser.name} is now ${updatedUser.enabled ? 'Active' : 'Suspended'}`)
    } catch {
      showToast('Failed to update user status')
    }
  }

  const filteredUsers = users.filter(u => {
    if (!search) return true
    const term = search.toLowerCase()
    return u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
  })

  return (
    <div className="admin-users">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-page-header">
        <div>
          <h2>User & Instructor Management 👥</h2>
          <p className="admin-sub">Monitor platform accounts, role authorities, and manage active statuses.</p>
        </div>
      </div>

      <div className="admin-controls">
        <div className="admin-tabs">
          {['ALL', 'ROLE_USER', 'ROLE_INSTRUCTOR', 'ROLE_ADMIN'].map(r => (
            <button
              key={r}
              className={`admin-tab ${roleFilter === r ? 'active' : ''}`}
              onClick={() => setRoleFilter(r)}
            >
              {r === 'ALL' ? 'All Accounts' : r === 'ROLE_USER' ? 'Learners' : r === 'ROLE_INSTRUCTOR' ? 'Instructors' : 'Admins'}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="admin-search-input"
        />
      </div>

      {loading ? (
        <div className="admin-loading">Loading platform users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="admin-empty">No users found matching criteria.</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {u.profileImage ? <img src={u.profileImage} alt={u.name} /> : u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div className="user-name">{u.name}</div>
                        <div className="user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge role-badge--${u.role?.toLowerCase().replace('role_', '')}`}>
                      {u.role === 'ROLE_ADMIN' ? '👑 Admin' : u.role === 'ROLE_INSTRUCTOR' ? '👨‍🏫 Instructor' : '🎓 Student'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-badge--${u.enabled ? 'active' : 'suspended'}`}>
                      {u.enabled ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button
                      className={`btn-action btn-action--${u.enabled ? 'suspend' : 'activate'}`}
                      onClick={() => handleToggleStatus(u)}
                    >
                      {u.enabled ? 'Suspend Account' : 'Activate Account'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
