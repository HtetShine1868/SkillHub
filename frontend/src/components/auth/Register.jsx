import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from './AuthLayout'
import AuthInput from './AuthInput'
import GoogleButton from './GoogleButton'

export default function Register() {

    const navigate = useNavigate()
    const { register } = useAuth()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
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

            await register(name, email, password, confirmPassword)
            navigate('/dashboard')

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

                <button
                    type="submit"
                    className="primary-button"
                    disabled={loading}
                >
                    {loading ? 'Creating account...' : 'Create Account'}
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
