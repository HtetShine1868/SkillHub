import axiosClient from "../api/axiosClient";

export const registerUser = async ({
    name,
    email,
    password,
    confirmPassword
}) => {

    const response =
        await axiosClient.post(
            "/api/auth/register",
            {
                name,
                email,
                password,
                confirmPassword
            }
        );

    return response.data;
};


export const loginUser = async ({
    email,
    password
}) => {

    const response =
        await axiosClient.post(
            "/api/auth/login",
            {
                email,
                password
            }
        );

    return response.data;
};


export const getCurrentUser = async () => {

    const response =
        await axiosClient.get(
            "/api/auth/me"
        );

    return response.data;
};


export const logoutUser = async () => {

    const response =
        await axiosClient.post(
            "/api/auth/logout"
        );

    return response.data;
};


export const loginWithGoogle = () => {

    window.location.href =
        `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
};