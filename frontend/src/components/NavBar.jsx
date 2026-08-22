import { NavLink, Link } from 'react-router-dom'
import './NavBar.css'

const NavBar = () => (
  <nav className="navbar">
    <Link to="/dashboard" className="navbar__logo">SkillHub</Link>
    <ul className="navbar__links">
      <li><NavLink to="/dashboard">Dashboard</NavLink></li>
      <li><NavLink to="/onboarding">Find Career</NavLink></li>
      <li><NavLink to="/careers">Careers</NavLink></li>
      <li><NavLink to="/courses">Courses</NavLink></li>
      <li><NavLink to="/my-learning">My Learning</NavLink></li>
      <li><NavLink to="/roadmap">Roadmap</NavLink></li>
      <li><NavLink to="/forum">Forum</NavLink></li>
    </ul>
  </nav>
)

export default NavBar

