import { useState, useEffect } from 'react'
import axiosClient from '../../api/axiosClient'
import './AdminUsersPage.css'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const loadReviews = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/api/admin/reviews')
      setReviews(Array.isArray(res.data) ? res.data : [])
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to remove this review for inappropriate content?')) return
    try {
      await axiosClient.delete(`/api/admin/reviews/${id}`)
      setReviews(prev => prev.filter(r => r.id !== id))
      showToast('Review removed from course.')
    } catch {
      showToast('Failed to remove review.')
    }
  }

  return (
    <div className="admin-users">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-page-header">
        <div>
          <h2>Review Moderation ⭐</h2>
          <p className="admin-sub">Monitor student feedback, course ratings, and remove reported reviews.</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Loading course reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="admin-empty">No course reviews posted yet.</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Learner</th>
                <th>Course ID</th>
                <th>Rating</th>
                <th>Feedback</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {r.userAvatar ? <img src={r.userAvatar} alt={r.userName} /> : r.userName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div className="user-name">{r.userName || 'Student'}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ color: '#38bdf8', fontWeight: 600 }}>Course #{r.courseId}</span></td>
                  <td>
                    <div style={{ color: '#f59e0b', fontWeight: 700 }}>
                      {'⭐'.repeat(r.rating || 5)} ({r.rating}/5)
                    </div>
                  </td>
                  <td>
                    <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', maxWidth: '350px' }}>
                      "{r.comment}"
                    </p>
                  </td>
                  <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button
                      className="btn-action btn-action--suspend"
                      onClick={() => handleDeleteReview(r.id)}
                    >
                      Delete Review
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
