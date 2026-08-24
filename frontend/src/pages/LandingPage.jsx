import { Link } from 'react-router-dom'
import './LandingPage.css'

export default function LandingPage() {
    return (
        <div className="landing">
            {/* Hero */}
            <section className="landing__hero">
                <div className="landing__hero-content">
                    <span className="landing__badge">🚀 Your Career Journey Starts Here</span>
                    <h1 className="landing__title">
                        Discover Your <span className="landing__gradient">Perfect Career</span><br />
                        Path with AI Guidance
                    </h1>
                    <p className="landing__subtitle">
                        SkillHub combines personalised career discovery, skill assessment,
                        adaptive roadmaps, and a skill-exchange community — all in one place.
                    </p>
                    <div className="landing__cta-group">
                        <Link to="/register" className="landing__btn landing__btn--primary">
                            Get Started Free
                        </Link>
                        <Link to="/login" className="landing__btn landing__btn--ghost">
                            Sign In
                        </Link>
                    </div>
                </div>
                <div className="landing__hero-visual">
                    <div className="landing__orb landing__orb--1" />
                    <div className="landing__orb landing__orb--2" />
                    <div className="landing__floating-cards">
                        <div className="landing__fcard">🎯 Career Match Found!</div>
                        <div className="landing__fcard">📊 85% Skill Score</div>
                        <div className="landing__fcard">🗺️ Roadmap Generated</div>
                        <div className="landing__fcard">🤝 Skill Exchange Active</div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="landing__features">
                <h2 className="landing__section-title">Everything You Need to Grow</h2>
                <p className="landing__section-sub">One platform. Every tool you need for your career journey.</p>
                <div className="landing__feature-grid">
                    {features.map(f => (
                        <div key={f.title} className="landing__feature-card">
                            <div className="landing__feature-icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="landing__bottom-cta">
                <h2>Ready to Chart Your Future?</h2>
                <p>Join thousands building careers with SkillHub.</p>
                <Link to="/register" className="landing__btn landing__btn--primary">
                    Create Free Account
                </Link>
            </section>
        </div>
    )
}

const features = [
    {
        icon: '🎯',
        title: 'Career Discovery',
        desc: 'Answer guided questions and let our algorithm surface the best-fit career paths for your personality and interests.'
    },
    {
        icon: '📊',
        title: 'Skill Assessment',
        desc: 'Benchmark your current skills against your target career with detailed gap analysis and scoring.'
    },
    {
        icon: '🗺️',
        title: 'Personalised Roadmap',
        desc: 'Get a step-by-step learning roadmap tailored to your goals, current skill level, and preferred pace.'
    },
    {
        icon: '📚',
        title: 'Curated Courses',
        desc: 'Access a library of structured courses aligned to your roadmap so every lesson has a purpose.'
    },
    {
        icon: '🤝',
        title: 'Skill Exchange',
        desc: 'Connect with learners worldwide. Teach what you know, learn what you need — a true peer community.'
    },
    {
        icon: '🏆',
        title: 'Track Progress',
        desc: 'Monitor milestones, celebrate wins, and stay motivated with progress dashboards and achievement badges.'
    }
]
