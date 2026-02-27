package com.greencampus.security;

import com.greencampus.model.enums.UserRole;

public record AuthenticatedUser(String username, UserRole role) {
}
