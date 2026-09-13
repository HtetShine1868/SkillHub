# Frontend auth — step by step

The SPA never stores the JWT in `localStorage`. The backend sets an HttpOnly cookie. Axios sends it because of `withCredentials: true`.

## 1. App boot — AuthProvider wraps everything

```jsx
// frontend/src/main.jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

On mount, `AuthProvider` calls `GET /api/auth/me`. If the cookie is valid, `user` is set. If not, `user` stays `null`.

```jsx
// frontend/src/context/AuthContext.jsx
useEffect(() => {
    loadCurrentUser();
}, []);

const loadCurrentUser = async () => {
    try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
    } catch {
        setUser(null);
    } finally {
        setLoading(false);
    }
};
```

That is why Google login works after a **full page** redirect to `/dashboard`: React starts fresh, reads the cookie via `/me`, then `ProtectedRoute` allows the page.

Context API:

```jsx
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
```

---

## 2. axiosClient — where requests go

```js
// frontend/src/api/axiosClient.js
export const apiBaseUrl = resolveApiUrl();

const axiosClient = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
});
```

- Dev: `http://localhost:8080`
- Prod: `https://skillhub-ljz1.onrender.com` (`VITE_API_URL`)
- If someone set `VITE_API_URL` to a Vercel URL, it is ignored (that caused login 404s)

`withCredentials: true` is required so the browser attaches `SKILLHUB_TOKEN` on cross-origin calls to Render.

---

## 3. authService.js — thin API layer

```js
// frontend/src/services/authService.js
export const loginUser = async ({ email, password }) => {
    const response = await axiosClient.post("/api/auth/login", { email, password });
    return response.data;
};

export const registerUser = async ({ name, email, password, confirmPassword, role }) => {
    const response = await axiosClient.post("/api/auth/register", {
        name, email, password, confirmPassword, role
    });
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await axiosClient.get("/api/auth/me");
    return response.data;
};

export const logoutUser = async () => {
    const response = await axiosClient.post("/api/auth/logout");
    return response.data;
};

export const loginWithGoogle = () => {
    window.location.href = `${apiBaseUrl}/oauth2/authorization/google`;
};
```

Google is **not** an axios call. It is a full navigation so Spring can redirect to Google and back.

---

## 4. Password login — Login.jsx → AuthContext → API

```jsx
// frontend/src/components/auth/Login.jsx
const { login } = useAuth();

const loggedInUser = await login(email, password);

const destination =
    loggedInUser?.role === 'ROLE_ADMIN'
        ? '/admin'
        : loggedInUser?.role === 'ROLE_INSTRUCTOR'
        ? '/instructor/dashboard'
        : '/dashboard';

navigate(destination);
```

`login` in context:

```jsx
const login = async (email, password) => {
    const loggedInUser = await loginUser({ email, password });
    setUser(loggedInUser);
    return loggedInUser;
};
```

Register is the same pattern (`register` → `registerUser` → `setUser` → navigate).

Layout/inputs (`AuthLayout.jsx`, `AuthInput.jsx`, `Auth.css`) are UI only.

---

## 5. Google button

```jsx
// frontend/src/components/auth/GoogleButton.jsx
import { loginWithGoogle } from "../../services/authService";

export default function GoogleButton() {
    return (
        <button type="button" className="google-btn" onClick={loginWithGoogle}>
            Continue with Google
        </button>
    );
}
```

Browser leaves the SPA. After Google + Spring:

```
https://skill-hub-dusky.vercel.app/dashboard
```

`vercel.json` must rewrite `/dashboard` to `index.html` (otherwise Vercel 404). OAuth callback itself hits **Render**, not Vercel:

```json
{
  "source": "/login/oauth2/:path*",
  "destination": "https://skillhub-ljz1.onrender.com/login/oauth2/:path*"
}
```

`loginWithGoogle` already uses `apiBaseUrl` (Render), so the user usually never hits those Vercel OAuth rewrites.

---

## 6. Guards

```jsx
// frontend/src/components/routing/ProtectedRoute.jsx
const { user, isAuthenticated, loading } = useAuth()

if (loading) return <div className="auth-loading">...</div>
if (!isAuthenticated) return <Navigate to="/login" replace />
if (user?.role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />
return children
```

`AdminRoute` / `InstructorRoute` check `user.role` the same way.

`App.jsx` wires routes:

```jsx
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

---

## 7. What happens after Google lands on /dashboard

1. Vercel serves `index.html` (SPA rewrite).
2. `AuthProvider` runs `getCurrentUser()`.
3. Axios `GET {Render}/api/auth/me` with cookie.
4. `JwtAuthenticationFilter` validates JWT, loads user.
5. `AuthController.getCurrentUser` returns `AuthResponse`.
6. `setUser(...)` → `isAuthenticated === true`.
7. `ProtectedRoute` renders `Dashboard`.

If the cookie is missing (wrong `FRONTEND_URL`, `SameSite`, or CORS), `/me` fails, `user` is null, and you bounce to `/login` even though Google succeeded on the backend.

---

## 8. Logout

```jsx
const logout = async () => {
    try {
        await logoutUser();  // POST /api/auth/logout clears cookie
    } finally {
        setUser(null);
    }
};
```

NavBar calls `logout()` from `useAuth()`.

---

## End-to-end file order (password)

1. `Login.jsx` — form submit  
2. `AuthContext.jsx` — `login()`  
3. `authService.js` — `loginUser()`  
4. `axiosClient.js` — `POST` + cookie  
5. `AuthController.java` — `/login`  
6. `AuthService.java` — verify password  
7. `JwtService.java` — sign token  
8. Cookie set → JSON back  
9. `setUser` + `navigate`  
10. Later: `JwtAuthenticationFilter` + `CustomUserDetailsService` on each API call  

## End-to-end file order (Google)

1. `GoogleButton.jsx`  
2. `authService.loginWithGoogle`  
3. `SecurityConfig` OAuth2 login  
4. Google account picker  
5. `OAuth2SuccessHandler.java`  
6. `AuthService.findOrCreateGoogleUser`  
7. `JwtService.generateToken`  
8. Redirect `{FRONTEND_URL}/dashboard`  
9. `vercel.json` → `index.html`  
10. `AuthContext.loadCurrentUser` → `GET /api/auth/me`  
11. `ProtectedRoute` → `Dashboard.jsx`  
