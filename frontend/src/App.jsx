import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ChatNotificationProvider } from './context/ChatNotificationContext'

// Navigation
import NavBar from './components/NavBar'

// Public
import LandingPage from './pages/LandingPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'

// Routing guards
import ProtectedRoute from './components/routing/ProtectedRoute'
import AdminRoute from './components/routing/AdminRoute'
import InstructorRoute from './components/routing/InstructorRoute'

// User pages
import Dashboard from './components/Dashboard'
import PersonalizedRoadmapPage from './pages/PersonalizedRoadmapPage'
import CareerOnboardingPage from './pages/CareerOnboardingPage'
import CareerDiscoveryPage from './pages/CareerDiscoveryPage'
import CareerPage from './pages/CareerPage'
import CareerDetailPage from './pages/CareerDetailPage'
import SkillAssessmentPage from './pages/SkillAssessmentPage'
import CoursesPage from './pages/CoursesPage'
import CoursePage from './pages/CoursePage'
import LessonPage from './pages/LessonPage'
import MyLearningPage from './pages/MyLearningPage'
import CertificatesPage from './pages/CertificatesPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'

// Instructor pages
import InstructorDashboard from './pages/instructor/InstructorDashboard'
import CourseEditorPage from './pages/instructor/CourseEditorPage'

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
import AdminCertificatesPage from './pages/admin/AdminCertificatesPage'
import AdminSkillExchangePage from './pages/admin/AdminSkillExchangePage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminReviewsPage from './pages/admin/AdminReviewsPage'

/** Root redirect: guests → landing, users → dashboard, instructors → /instructor/dashboard, admins → /admin */
function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/" replace />
  if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />
  if (user.role === 'ROLE_INSTRUCTOR') return <Navigate to="/instructor/dashboard" replace />
  return <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <ChatNotificationProvider>
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
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Career pages */}
        <Route path="/careers" element={<ProtectedRoute><CareerPage /></ProtectedRoute>} />
        <Route path="/careers/:id" element={<ProtectedRoute><CareerDetailPage /></ProtectedRoute>} />

        {/* Keep legacy routes accessible but not in navbar */}
        <Route path="/onboarding" element={<ProtectedRoute><CareerOnboardingPage /></ProtectedRoute>} />
        <Route path="/discover" element={<ProtectedRoute><CareerDiscoveryPage /></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute><SkillAssessmentPage /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><PersonalizedRoadmapPage /></ProtectedRoute>} />
        <Route path="/my-certificates" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} />

        {/* Courses */}
        <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
        <Route path="/courses/:id" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
        <Route path="/courses/:id/lessons/:lessonId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />

        {/* My Learning (with sub-tabs for courses + roadmap) */}
        <Route path="/learning" element={<Navigate to="/my-learning" replace />} />
        <Route path="/my-learning" element={<ProtectedRoute><MyLearningPage /></ProtectedRoute>} />

        {/* Chat / Instructor Messaging */}
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

        {/* Skill Exchange — new routes */}
        <Route path="/skill-exchange" element={<ProtectedRoute><ForumHome /></ProtectedRoute>} />
        <Route path="/skill-exchange/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
        <Route path="/skill-exchange/project/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
        <Route path="/skill-exchange/project/:id/requests" element={<ProtectedRoute><ProjectRequests /></ProtectedRoute>} />
        <Route path="/skill-exchange/my-projects" element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />

        {/* Legacy /forum aliases → redirect to /skill-exchange */}
        <Route path="/forum" element={<Navigate to="/skill-exchange" replace />} />
        <Route path="/forum/create" element={<Navigate to="/skill-exchange/create" replace />} />
        <Route path="/forum/my-projects" element={<Navigate to="/skill-exchange/my-projects" replace />} />

        {/* ── Instructor Routes ── */}
        <Route path="/instructor" element={<Navigate to="/instructor/dashboard" replace />} />
        <Route path="/instructor/dashboard" element={<InstructorRoute><InstructorDashboard /></InstructorRoute>} />
        <Route path="/instructor/courses" element={<Navigate to="/instructor/dashboard" replace />} />
        <Route path="/instructor/courses/create" element={<InstructorRoute><CourseEditorPage /></InstructorRoute>} />
        <Route path="/instructor/courses/:id/edit" element={<InstructorRoute><CourseEditorPage /></InstructorRoute>} />

        {/* ── Admin Routes ── */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
          <Route index element={<AdminStatsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="careers" element={<AdminCareersPage />} />
          <Route path="skills" element={<AdminSkillsPage />} />
          <Route path="career-skills" element={<AdminCareerSkillsPage />} />
          <Route path="discovery" element={<AdminDiscoveryQuestionsPage />} />
          <Route path="assessment" element={<AdminAssessmentQuestionsPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="certificates" element={<AdminCertificatesPage />} />
          <Route path="skill-exchange" element={<AdminSkillExchangePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </ChatNotificationProvider>
  )
}

export default App