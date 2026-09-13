# Backend auth — step by step

Package: `com.example.backend.auth` plus `config` and `user`.

## 1. SecurityConfig decides who can enter

`SecurityConfig` turns CSRF off (JWT cookie + API), uses **stateless** sessions, allows login/OAuth without a token, and runs `JwtAuthenticationFilter` before the default username/password filter. Google success is handled by `OAuth2SuccessHandler`.

```java
// backend/src/main/java/com/example/backend/config/SecurityConfig.java
.authorizeHttpRequests(auth -> auth
    .requestMatchers(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/logout"
    ).permitAll()
    .requestMatchers(
            "/oauth2/**",
            "/login/oauth2/**"
    ).permitAll()
    // ...
    .anyRequest().authenticated()
)
.oauth2Login(oauth ->
        oauth.successHandler(oauth2SuccessHandler)
)
.addFilterBefore(
        jwtAuthenticationFilter,
        UsernamePasswordAuthenticationFilter.class
);
```

`GET /api/auth/me` is **not** public. The filter must attach a user from the cookie first.

Password hashing bean:

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

Google client id/secret and JWT secret come from `application.properties`:

```properties
jwt.secret=${JWT_SECRET:...}
jwt.expiration=${JWT_EXPIRATION:86400000}
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID:...}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET:...}
spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}
app.frontend-url=${FRONTEND_URL:http://localhost:5173}
```

---

## 2. DTOs — what the API accepts and returns

Login body:

```java
// auth/dto/LoginRequest.java
public class LoginRequest {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String password;
}
```

Response (no password, no raw JWT — the token is in the cookie):

```java
// auth/dto/AuthResponse.java
public class AuthResponse {
    private Long id;
    private String name;
    private String email;
    private String profileImage;
    private String provider;      // LOCAL or GOOGLE
    private boolean emailVerified;
    private String role;          // ROLE_USER, ROLE_INSTRUCTOR, ROLE_ADMIN
    private String initials;
    private List<String> skills;
    private String level;
}
```

`AuthProvider` on the `User` row:

```java
public enum AuthProvider {
    LOCAL,
    GOOGLE
}
```

---

## 3. AuthController — password HTTP API

### Register

`POST /api/auth/register` → `authService.register()` → set cookie → return `AuthResponse`.

```java
@PostMapping("/register")
public ResponseEntity<AuthResponse> register(
        @Valid @RequestBody RegisterRequest request,
        HttpServletResponse response
) {
    AuthResponse authResponse = authService.register(request);
    User user = userRepository.findByEmail(authResponse.getEmail()).orElseThrow();
    addTokenCookie(response, jwtService.generateToken(user.getEmail()));
    return ResponseEntity.ok(authResponse);
}
```

### Login

```java
@PostMapping("/login")
public ResponseEntity<AuthResponse> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletResponse response
) {
    AuthResponse authResponse = authService.login(request);
    addTokenCookie(response, jwtService.generateToken(authResponse.getEmail()));
    return ResponseEntity.ok(authResponse);
}
```

### Who am I

Used on every page load. `@AuthenticationPrincipal` is filled by the JWT filter.

```java
@GetMapping("/me")
public ResponseEntity<AuthResponse> getCurrentUser(
        @AuthenticationPrincipal UserDetails principal
) {
    User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
    return ResponseEntity.ok(authService.toResponse(user));
}
```

### Logout

Clears `SKILLHUB_TOKEN` (`maxAge = 0`).

### Cookie flags

```java
private void applyCookieFlags(Cookie cookie) {
    boolean secure = frontendUrl != null && frontendUrl.toLowerCase().startsWith("https");
    cookie.setHttpOnly(true);
    cookie.setSecure(secure);
    cookie.setPath("/");
    cookie.setAttribute("SameSite", secure ? "None" : "Lax");
}
```

Local (`http://localhost:5173`): `SameSite=Lax`, not Secure.  
Production (`https://skill-hub-dusky.vercel.app`): `Secure` + `SameSite=None` so the cookie is sent cross-site to Render.

---

## 4. AuthService — business rules

### Register

- Normalize email.
- Confirm passwords match.
- Reject duplicate email.
- Role is `USER` unless the body asks for instructor.
- Password stored with `passwordEncoder.encode(...)`.
- Provider = `LOCAL`.

```java
User newUser = User.builder()
        .name(request.getName().trim())
        .email(email)
        .password(passwordEncoder.encode(request.getPassword()))
        .provider(AuthProvider.LOCAL)
        .role(assignedRole)
        .emailVerified(false)
        .build();
return toResponse(userRepository.save(newUser));
```

### Login

- Find user by email.
- If `password == null`, this is a Google-only account → tell them to use Google.
- `passwordEncoder.matches(raw, hash)`.

```java
if (user.getPassword() == null) {
    throw new IllegalArgumentException(
            "This account uses social login. Please sign in with Google."
    );
}
if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
    throw new IllegalArgumentException("Invalid email or password");
}
```

### Google upsert (shared by OAuth)

```java
public User findOrCreateGoogleUser(
        String email, String name, String providerId, String profileImage
) {
    User user = userRepository.findByEmail(email.toLowerCase()).orElse(null);
    if (user == null) {
        user = User.builder()
                .email(email.toLowerCase())
                .name(name)
                .provider(AuthProvider.GOOGLE)
                .providerId(providerId)
                .profileImage(profileImage)
                .emailVerified(true)
                .role(Role.USER)
                .build();
        user = userRepository.save(user);
    } else {
        user.setName(name);
        user.setProviderId(providerId);
        user.setProfileImage(profileImage);
        user.setEmailVerified(true);
        user = userRepository.save(user);
    }
    return user;
}
```

If someone already registered with the same email, Google **links** to that row (updates profile) instead of creating a second user.

`toResponse()` adds skills, level, and initials for the dashboard.

`generateToken(User)` delegates to `JwtService`.

---

## 5. JwtService — create and check tokens

```java
public String generateToken(String email) {
    Date now = new Date();
    Date expiry = new Date(now.getTime() + expiration);
    return Jwts.builder()
            .subject(email)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(key)
            .compact();
}

public String extractEmail(String token) {
    return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
}
```

The JWT subject is the **email**. That is what `/api/auth/me` and the filter use as the username.

---

## 6. JwtAuthenticationFilter — every request

Order of token sources:

1. `Authorization: Bearer <jwt>`
2. Cookie `SKILLHUB_TOKEN` (also accepts `token` / `jwt`)

```java
String token = extractToken(request);

if (token != null && jwtService.isValid(token)
        && SecurityContextHolder.getContext().getAuthentication() == null) {
    String email = jwtService.extractEmail(token);
    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
    UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
    SecurityContextHolder.getContext().setAuthentication(authentication);
}
filterChain.doFilter(request, response);
```

After this, `@AuthenticationPrincipal UserDetails` works, and `hasRole("ADMIN")` uses the authorities from `CustomUserDetailsService`.

---

## 7. CustomUserDetailsService

Loads the DB user and maps `Role` → Spring authority `ROLE_USER` / `ROLE_INSTRUCTOR` / `ROLE_ADMIN`. Google users may have a null password; Spring still needs a non-null string, so it uses `""`.

```java
UserDetails userDetails = org.springframework.security.core.userdetails.User
        .withUsername(user.getEmail())
        .password(user.getPassword() == null ? "" : user.getPassword())
        .authorities("ROLE_" + user.getRole().name())
        .build();
```

Results are cached for 5 minutes.

---

## 8. Google OAuth — OAuth2Service + OAuth2SuccessHandler

`OAuth2Service` is a small wrapper (used if you want a named Google entry point):

```java
public User processGoogleUser(String email, String name, String googleId, String profileImage) {
    return authService.findOrCreateGoogleUser(email, name, googleId, profileImage);
}
```

The real callback is `OAuth2SuccessHandler.onAuthenticationSuccess`:

```java
OAuth2User oauthUser = oauthToken.getPrincipal();
String email = oauthUser.getAttribute("email");
String name = oauthUser.getAttribute("name");
String googleId = oauthUser.getAttribute("sub");
String profileImage = oauthUser.getAttribute("picture");

User user = authService.findOrCreateGoogleUser(email, name, googleId, profileImage);
String token = authService.generateToken(user);

Cookie cookie = new Cookie("SKILLHUB_TOKEN", token);
// same Secure / SameSite rules as AuthController
response.addCookie(cookie);

getRedirectStrategy().sendRedirect(
        request, response, frontendUrl + "/dashboard"
);
```

Spring’s OAuth2 login:

1. Browser hits `/oauth2/authorization/google`.
2. User authenticates at Google.
3. Google hits `/login/oauth2/code/google` on **the backend**.
4. This handler runs.
5. Browser lands on the **frontend** `/dashboard` with the cookie set for the API host (Render). The frontend then calls `/api/auth/me` with `withCredentials: true`.

---

## 9. Password vs Google — same cookie after that

Both paths end the same way:

1. A `User` row exists.
2. A JWT is created from `user.getEmail()`.
3. Cookie `SKILLHUB_TOKEN` is set.
4. The SPA treats the user as logged in once `/api/auth/me` succeeds.

Difference: password path returns JSON immediately; Google path is a **browser redirect** (no JSON body).
