package com.greencampus.security;

import com.greencampus.model.enums.UserRole;

public final class AuthContext {

    private AuthContext() {
    }

    public static AuthenticatedUser fromAuthorizationHeader(String authHeader) {
        String username = JwtUtil.extractUsername(authHeader);
        String role = JwtUtil.extractRole(authHeader);
        if (username == null || role == null) {
            return null;
        }
        try {
            return new AuthenticatedUser(username, UserRole.valueOf(role));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
