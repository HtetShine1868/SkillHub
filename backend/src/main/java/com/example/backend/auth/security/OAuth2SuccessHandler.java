package com.example.backend.auth.security;

import com.example.backend.auth.service.AuthService;

import com.example.backend.user.entity.User;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;

    public OAuth2SuccessHandler(@Lazy AuthService authService) {
        this.authService = authService;
    }


    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2AuthenticationToken oauthToken =
                (OAuth2AuthenticationToken) authentication;

        OAuth2User oauthUser =
                oauthToken.getPrincipal();

        String email =
                oauthUser.getAttribute("email");

        String name =
                oauthUser.getAttribute("name");

        String googleId =
                oauthUser.getAttribute("sub");

        String profileImage =
                oauthUser.getAttribute("picture");

        User user = authService.findOrCreateGoogleUser(
                email,
                name,
                googleId,
                profileImage
        );

        String token = authService.generateToken(user);

        Cookie cookie = new Cookie(
                "SKILLHUB_TOKEN",
                token
        );

        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60 * 24);

        response.addCookie(cookie);

        getRedirectStrategy().sendRedirect(
                request,
                response,
                frontendUrl + "/dashboard"
        );
    }
}
