import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from './AuthLayout'
import AuthInput from './AuthInput'
import GoogleButton from './GoogleButton'

export default function Register() {

    const navigate = useNavigate()
    const { register } = useAuth()

    const [role, setRole] = useState('ROLE_USER') // 'ROLE_USER' | 'ROLE_INSTRUCTOR'
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    
    // Instructor specific fields
    const [title, setTitle] = useState('')
    const [bio, setBio] = useState('')
    const [expertise, setExpertise] = useState('')
    const [experience, setExperience] = useState('')

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            await register(name, email, password, confirmPassword, role)
            navigate(role === 'ROLE_INSTRUCTOR' ? '/instructor/dashboard' : '/dashboard')
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Registration failed. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Create your account 🚀"
            subtitle="Start your SkillHub journey today."
        >

            {/* Account Type Selection */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button
                    type="button"
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '10px',
                        border: role === 'ROLE_USER' ? '2px solid #7c3aed' : '1px solid rgba(255,255,255,0.1)',
                        background: role === 'ROLE_USER' ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255,255,255,0.03)',
                        color: role === 'ROLE_USER' ? '#a78bfa' : '#cbd5e1',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => setRole('ROLE_USER')}
                >
                    🎓 Learner / Student
                </button>
                <button
                    type="button"
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '10px',
                        border: role === 'ROLE_INSTRUCTOR' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                        background: role === 'ROLE_INSTRUCTOR' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.03)',
                        color: role === 'ROLE_INSTRUCTOR' ? '#38bdf8' : '#cbd5e1',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => setRole('ROLE_INSTRUCTOR')}
                >
                    👨‍🏫 Instructor
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                <AuthInput
                    label="Full Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    minLength={2}
                />

                <AuthInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                />

                <AuthInput
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
                />

                <AuthInput
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                />

                {/* Additional Instructor Fields */}
                {role === 'ROLE_INSTRUCTOR' && (
                    <div style={{ padding: '16px', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '12px', marginBottom: '16px' }}>
                        <h4 style={{ margin: '0 0 12px', color: '#38bdf8', fontSize: '0.9rem' }}>Instructor Profile Details</h4>
                        
                        <AuthInput
                            label="Professional Title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Senior Java Backend Developer"
                        />

                        <AuthInput
                            label="Years of Experience"
                            type="text"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            placeholder="e.g. 5 Years"
                        />

                        <AuthInput
                            label="Core Expertise / Skills"
                            type="text"
                            value={expertise}
                            onChange={(e) => setExpertise(e.target.value)}
                            placeholder="e.g. Java, Spring Boot, REST API"
                        />

                        <div className="auth-input-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#cbd5e1' }}>Short Biography</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Describe your teaching and industry background..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    className="primary-button"
                    disabled={loading}
                >
                    {loading ? 'Creating account...' : `Create ${role === 'ROLE_INSTRUCTOR' ? 'Instructor' : 'Student'} Account`}
                </button>

            </form>

            <div className="divider">
                <span>OR</span>
            </div>

            <GoogleButton />

            <p className="auth-switch">
                Already have an account?{' '}
                <Link to="/login">Sign in</Link>
            </p>

        </AuthLayout>
    )
}
