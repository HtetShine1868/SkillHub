import { useAuth } from '../context/AuthContext'

export default function Dashboard() {

    const { user, logout } = useAuth()

    const handleLogout = async () => {
        await logout()
        // The ProtectedRoute will handle the redirect to /login
        // once user is set to null in AuthContext
        window.location.href = '/login'
    }

    return (
        <div className="dashboard-page">

            <header className="dashboard-header">

                <div className="dashboard-brand">
                    SkillHub
                </div>

                <div className="dashboard-user">

                    {user?.profileImage ? (
                        <img
                            src={user.profileImage}
                            alt={user.name}
                            className="dashboard-avatar"
                        />
                    ) : (
                        <div className="dashboard-avatar-placeholder">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                    )}

                    <span className="dashboard-username">
                        {user?.name}
                    </span>

                    <button
                        className="dashboard-logout-btn"
                        onClick={handleLogout}
                    >
                        Sign out
                    </button>

                </div>

            </header>

            <main className="dashboard-main">

                <div className="dashboard-welcome">

                    <h1>
                        Welcome back, {user?.name?.split(' ')[0]} 👋
                    </h1>

                    <p className="dashboard-subtitle">
                        You&apos;re now logged in to SkillHub.
                        Your dashboard is coming soon.
                    </p>

                </div>

                <div className="dashboard-cards">

                    <div className="dashboard-card">
                        <span className="dashboard-card-icon">🎯</span>
                        <h3>Find Your Career</h3>
                        <p>Discover career paths that match your skills and interests.</p>
                    </div>

                    <div className="dashboard-card">
                        <span className="dashboard-card-icon">🧭</span>
                        <h3>Build Your Roadmap</h3>
                        <p>Create a personalised learning roadmap to reach your goals.</p>
                    </div>

                    <div className="dashboard-card">
                        <span className="dashboard-card-icon">🤝</span>
                        <h3>Exchange Skills</h3>
                        <p>Connect with others to teach and learn skills together.</p>
                    </div>

                </div>

                <div className="dashboard-user-info">
                    <h2>Your Profile</h2>
                    <div className="user-info-grid">
                        <div className="user-info-item">
                            <span className="user-info-label">Name</span>
                            <span className="user-info-value">{user?.name}</span>
                        </div>
                        <div className="user-info-item">
                            <span className="user-info-label">Email</span>
                            <span className="user-info-value">{user?.email}</span>
                        </div>
                        <div className="user-info-item">
                            <span className="user-info-label">Provider</span>
                            <span className="user-info-value">{user?.provider}</span>
                        </div>
                        <div className="user-info-item">
                            <span className="user-info-label">Email Verified</span>
                            <span className={`user-info-badge ${user?.emailVerified ? 'badge-green' : 'badge-yellow'}`}>
                                {user?.emailVerified ? '✓ Verified' : 'Not verified'}
                            </span>
                        </div>
                    </div>
                </div>

            </main>

        </div>
    )
}
