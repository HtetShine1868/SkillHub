import { NavLink } from 'react-router-dom'
import './ForumNavbar.css'

export default function ForumNavbar() {
  return (
    <div className="forum-subnav">
      <NavLink to="/skill-exchange" end className="forum-subnav__link">
        Explore Projects
      </NavLink>
      <NavLink to="/skill-exchange/my-projects" className="forum-subnav__link">
        My Projects & Requests
      </NavLink>
      <NavLink to="/skill-exchange/create" className="forum-subnav__link forum-subnav__link--create">
        + Create Project
      </NavLink>
    </div>
  )
}
