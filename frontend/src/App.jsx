import { Routes, Route, Navigate } from 'react-router-dom'

// Navigation
import NavBar from './components/NavBar'

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

// Career System pages
import CareerOnboardingPage from './pages/CareerOnboardingPage'
import CareerDiscoveryPage from './pages/CareerDiscoveryPage'
import CareerListPage from './pages/CareerListPage'
import CareerDetailPage from './pages/CareerDetailPage'

// Learning System pages (Phase 3-6)
import SkillAssessmentPage from './pages/SkillAssessmentPage'
import CoursesPage from './pages/CoursesPage'
import CoursePage from './pages/CoursePage'
import LessonPage from './pages/LessonPage'
import MyLearningPage from './pages/MyLearningPage'

function App() {
  return (
    <>
      <NavBar />
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

        {/* Career System */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <CareerOnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <CareerDiscoveryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/careers"
          element={
            <ProtectedRoute>
              <CareerListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/careers/:id"
          element={
            <ProtectedRoute>
              <CareerDetailPage />
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

        {/* Learning System */}
        <Route
          path="/assessment"
          element={
            <ProtectedRoute>
              <SkillAssessmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute>
              <CoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id/lessons/:lessonId"
          element={
            <ProtectedRoute>
              <LessonPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-learning"
          element={
            <ProtectedRoute>
              <MyLearningPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </>
  )
}

export default App