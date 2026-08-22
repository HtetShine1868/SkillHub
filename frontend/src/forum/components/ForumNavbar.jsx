import { NavLink } from 'react-router-dom'
import './ForumNavbar.css'

export default function ForumNavbar() {
  return (
    <div className="forum-subnav">
      <NavLink to="/forum" end className="forum-subnav__link">
        Explore Projects
      </NavLink>
      <NavLink to="/forum/my-projects" className="forum-subnav__link">
        My Projects
      </NavLink>
      <NavLink to="/forum/create" className="forum-subnav__link forum-subnav__link--create">
        + Create Project
      </NavLink>
    </div>
  )
}
