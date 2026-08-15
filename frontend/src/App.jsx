import { Routes, Route, Navigate } from 'react-router-dom'
import ForumHome from './forum/pages/ForumHome'
import CreateProject from './forum/pages/CreateProject'
import ProjectDetails from './forum/pages/ProjectDetails'
import MyProjects from './forum/pages/MyProjects'
import ProjectRequests from './forum/pages/ProjectRequests'

function App() {
  return (
    <Routes>
      {/* Redirect root to forum */}
      <Route path="/" element={<Navigate to="/forum" replace />} />

      {/* Forum routes */}
      <Route path="/forum" element={<ForumHome />} />
      <Route path="/forum/create" element={<CreateProject />} />
      <Route path="/forum/project/:id" element={<ProjectDetails />} />
      <Route path="/forum/project/:id/requests" element={<ProjectRequests />} />
      <Route path="/forum/my-projects" element={<MyProjects />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/forum" replace />} />
    </Routes>
  )
}

export default App
