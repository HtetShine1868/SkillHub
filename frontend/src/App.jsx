import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Navigation
import NavBar from './components/NavBar'

// Public
import LandingPage from './pages/LandingPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'

// Routing guards
import ProtectedRoute from './components/routing/ProtectedRoute'
import AdminRoute from './components/routing/AdminRoute'

// User pages
import Dashboard from './components/Dashboard'
import PersonalizedRoadmapPage from './pages/PersonalizedRoadmapPage'
import CareerOnboardingPage from './pages/CareerOnboardingPage'
import CareerDiscoveryPage from './pages/CareerDiscoveryPage'
import CareerListPage from './pages/CareerListPage'
import CareerDetailPage from './pages/CareerDetailPage'
import SkillAssessmentPage from './pages/SkillAssessmentPage'
import CoursesPage from './pages/CoursesPage'
import CoursePage from './pages/CoursePage'
import LessonPage from './pages/LessonPage'
import MyLearningPage from './pages/MyLearningPage'

// Forum (Skill Exchange)
import ForumHome from './forum/pages/ForumHome'
import CreateProject from './forum/pages/CreateProject'
import ProjectDetails from './forum/pages/ProjectDetails'
import MyProjects from './forum/pages/MyProjects'
import ProjectRequests from './forum/pages/ProjectRequests'

// Admin shell + pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminStatsPage from './pages/admin/AdminStatsPage'
import AdminCareersPage from './pages/admin/AdminCareersPage'
import AdminSkillsPage from './pages/admin/AdminSkillsPage'
import AdminCareerSkillsPage from './pages/admin/AdminCareerSkillsPage'
import AdminDiscoveryQuestionsPage from './pages/admin/AdminDiscoveryQuestionsPage'
import AdminAssessmentQuestionsPage from './pages/admin/AdminAssessmentQuestionsPage'
import AdminCoursesPage from './pages/admin/AdminCoursesPage'

/** Root redirect: guests → landing, users → dashboard, admins → /admin */
function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/" replace />
  if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />
  return <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <>
      <NavBar />
      <Routes>

        {/* Root smart redirect */}
        <Route path="/home" element={<RootRedirect />} />

        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── User Protected Routes ── */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><PersonalizedRoadmapPage /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><CareerOnboardingPage /></ProtectedRoute>} />
        <Route path="/discover" element={<ProtectedRoute><CareerDiscoveryPage /></ProtectedRoute>} />
        <Route path="/careers" element={<ProtectedRoute><CareerListPage /></ProtectedRoute>} />
        <Route path="/careers/:id" element={<ProtectedRoute><CareerDetailPage /></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute><SkillAssessmentPage /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
        <Route path="/courses/:id" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
        <Route path="/courses/:id/lessons/:lessonId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
        <Route path="/my-learning" element={<ProtectedRoute><MyLearningPage /></ProtectedRoute>} />

        {/* Forum / Skill Exchange */}
        <Route path="/forum" element={<ProtectedRoute><ForumHome /></ProtectedRoute>} />
        <Route path="/forum/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
        <Route path="/forum/project/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
        <Route path="/forum/project/:id/requests" element={<ProtectedRoute><ProjectRequests /></ProtectedRoute>} />
        <Route path="/forum/my-projects" element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />

        {/* ── Admin Routes ── */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
          <Route index element={<AdminStatsPage />} />
          <Route path="careers" element={<AdminCareersPage />} />
          <Route path="skills" element={<AdminSkillsPage />} />
          <Route path="career-skills" element={<AdminCareerSkillsPage />} />
          <Route path="discovery" element={<AdminDiscoveryQuestionsPage />} />
          <Route path="assessment" element={<AdminAssessmentQuestionsPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </>
  )
}

export default App