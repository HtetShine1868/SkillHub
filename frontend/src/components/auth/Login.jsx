import {
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../../context/AuthContext";

import AuthLayout
    from "../../components/auth/AuthLayout";

import AuthInput
    from "../../components/auth/AuthInput";

import GoogleButton
    from "../../components/auth/GoogleButton";


export default function Login() {

    const navigate =
        useNavigate();

    const {
        login
    } = useAuth();


    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    const handleSubmit =
        async (event) => {

            event.preventDefault();

            setError("");
            setLoading(true);

            try {

                await login(
                    email,
                    password
                );

                navigate(
                    "/dashboard"
                );

            } catch (error) {

                setError(
                    error.response?.data?.message ||
                    "Invalid email or password"
                );

            } finally {

                setLoading(false);
            }
        };


    return (
        <AuthLayout
            title="Welcome back 👋"
            subtitle="Continue your SkillHub journey."
        >

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            <form
                onSubmit={handleSubmit}
            >

                <AuthInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                />


                <AuthInput
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                />


                <div className="forgot-row">

                    <Link to="#">
                        Forgot password?
                    </Link>

                </div>


                <button
                    type="submit"
                    className="primary-button"
                    disabled={loading}
                >

                    {loading
                        ? "Signing in..."
                        : "Sign In"
                    }

                </button>

            </form>


            <div className="divider">

                <span>OR</span>

            </div>


            <GoogleButton />


            <p className="auth-switch">

                Don't have an account?

                <Link to="/register">
                    Create account
                </Link>

            </p>

        </AuthLayout>
    );
}