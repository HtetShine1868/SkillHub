export default function AuthLayout({
    title,
    subtitle,
    children
}) {

    return (
        <div className="auth-page">

            <div className="auth-container">

                <div className="auth-visual">

                    <div className="visual-content">

                        <div className="brand">
                            SkillHub
                        </div>

                        <h2>
                            Learn skills.
                            <br />
                            Build your future.
                        </h2>

                        <p>
                            Discover the right career,
                            build your roadmap and
                            exchange skills with others.
                        </p>

                        <div className="floating-card card-one">
                            🎯 Find your career
                        </div>

                        <div className="floating-card card-two">
                            🧭 Build your roadmap
                        </div>

                        <div className="floating-card card-three">
                            🤝 Exchange skills
                        </div>

                    </div>

                </div>


                <div className="auth-form-section">

                    <div className="auth-form">

                        <h1>
                            {title}
                        </h1>

                        <p className="subtitle">
                            {subtitle}
                        </p>

                        {children}

                    </div>

                </div>

            </div>

        </div>
    );
}