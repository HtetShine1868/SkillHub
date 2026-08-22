import { Routes, Route, Navigate } from 'react-router-dom'

// Forum pages
import ForumHome from './forum/pages/ForumHome'
import CreateProject from './forum/pages/CreateProject'
import ProjectDetails from './forum/pages/ProjectDetails'
import MyProjects from './forum/pages/MyProjects'
import ProjectRequests from './forum/pages/ProjectRequests'

// Authentication
import Login from './components/auth/Login'
import Register from './components/auth/Register'

// Protected pages
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/routing/ProtectedRoute'
import PersonalizedRoadmapPage from './pages/PersonalizedRoadmapPage'

function App() {
  return (
    <Routes>

      {/* Root */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Personalized Roadmap */}
      <Route
        path="/roadmap"
        element={
          <ProtectedRoute>
            <PersonalizedRoadmapPage />
          </ProtectedRoute>
        }
      />

      {/* Forum */}
      <Route
        path="/forum"
        element={
          <ProtectedRoute>
            <ForumHome />
          </ProtectedRoute>
        }
      />

      <Route
        path="/forum/create"
        element={
          <ProtectedRoute>
            <CreateProject />
          </ProtectedRoute>
        }
      />

      <Route
        path="/forum/project/:id"
        element={
          <ProtectedRoute>
            <ProjectDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/forum/project/:id/requests"
        element={
          <ProtectedRoute>
            <ProjectRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/forum/my-projects"
        element={
          <ProtectedRoute>
            <MyProjects />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  )
}

export default App