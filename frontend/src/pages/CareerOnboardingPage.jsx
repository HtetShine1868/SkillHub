import { useNavigate } from 'react-router-dom'
import './CareerOnboardingPage.css'

const CareerOnboardingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="onboarding">
      {/* Animated background blobs */}
      <div className="onboarding__blob onboarding__blob--1" />
      <div className="onboarding__blob onboarding__blob--2" />
      <div className="onboarding__blob onboarding__blob--3" />

      <div className="onboarding__content">
        <div className="onboarding__badge">🚀 Career Discovery</div>

        <h1 className="onboarding__title">
          Shape Your <span className="onboarding__highlight">Career Path</span><br />
          with Personalized Learning
        </h1>
        <p className="onboarding__subtitle">
          SkillHub analyzes your interests, strengths, and goals to build a
          custom roadmap — from your first skill to your dream job.
        </p>

        <div className="onboarding__cards">
          {/* Option A */}
          <button
            id="btn-find-career"
            className="onboarding__card onboarding__card--discover"
            onClick={() => navigate('/discover')}
          >
            <div className="onboarding__card-icon">🔍</div>
            <h2 className="onboarding__card-title">Find My Career</h2>
            <p className="onboarding__card-desc">
              Answer a short set of questions and let our matching engine
              surface the careers best aligned to your interests and personality.
            </p>
            <span className="onboarding__card-cta">Start Discovery →</span>
          </button>

          {/* Option B */}
          <button
            id="btn-browse-careers"
            className="onboarding__card onboarding__card--browse"
            onClick={() => navigate('/careers')}
          >
            <div className="onboarding__card-icon">🗺️</div>
            <h2 className="onboarding__card-title">I Know My Career</h2>
            <p className="onboarding__card-desc">
              Already have a destination in mind? Browse all available career
              paths and jump straight to building your personalized roadmap.
            </p>
            <span className="onboarding__card-cta">Browse Careers →</span>
          </button>
        </div>

        <p className="onboarding__note">
          ✦ Your selections are saved — you can always change your path later.
        </p>
      </div>
    </div>
  )
}

export default CareerOnboardingPage
