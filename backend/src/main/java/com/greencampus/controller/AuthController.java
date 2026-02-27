package com.greencampus.controller;

import com.greencampus.model.User;
import com.greencampus.repository.UserRepository;
import com.greencampus.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        return userRepository.findByUsername(username)
                .filter(u -> hashPassword(password).equals(u.getPasswordHash()))
                .map(u -> {
                    String token = JwtUtil.create(u.getUsername(), u.getRole().name());
                    return ResponseEntity.ok(Map.of(
                            "token", token,
                            "username", u.getUsername(),
                            "role", u.getRole().name(),
                            "displayName", u.getDisplayName()));
                })
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid credentials")));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        String sub = JwtUtil.validateAndGetSubject(auth.substring(7));
        if (sub == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }
        return userRepository.findByUsername(sub)
                .map(u -> ResponseEntity.ok(Map.of(
                        "username", u.getUsername(),
                        "role", u.getRole().name(),
                        "displayName", u.getDisplayName())))
                .orElse(ResponseEntity.status(401).body(Map.of("error", "User not found")));
    }

    static String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash)
                sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
