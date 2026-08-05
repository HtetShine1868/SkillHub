import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    getCurrentUser,
    loginUser,
    registerUser,
    logoutUser,
    loginWithGoogle
} from "../services/authService";

const AuthContext =
    createContext(null);


export function AuthProvider({
    children
}) {

    const [user, setUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        loadCurrentUser();

    }, []);


    const loadCurrentUser =
        async () => {

            try {

                const currentUser =
                    await getCurrentUser();

                setUser(currentUser);

            } catch {

                setUser(null);

            } finally {

                setLoading(false);
            }
        };


    const login = async (
        email,
        password
    ) => {

        const loggedInUser =
            await loginUser({
                email,
                password
            });

        setUser(loggedInUser);

        return loggedInUser;
    };


    const register = async (
        name,
        email,
        password,
        confirmPassword
    ) => {

        const newUser =
            await registerUser({
                name,
                email,
                password,
                confirmPassword
            });

        setUser(newUser);

        return newUser;
    };


    const logout = async () => {

        try {

            await logoutUser();

        } finally {

            setUser(null);
        }
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                googleLogin: loginWithGoogle
            }}
        >

            {children}

        </AuthContext.Provider>
    );
}


export function useAuth() {

    return useContext(AuthContext);
}