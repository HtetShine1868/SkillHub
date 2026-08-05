import {
    loginWithGoogle
} from "../../services/authService";


export default function GoogleButton() {

    return (
        <button
            type="button"
            className="google-button"
            onClick={loginWithGoogle}
        >

            <span className="google-icon">
                G
            </span>

            Continue with Google

        </button>
    );
}