package com.greencampus.security;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Lightweight JWT implementation using HMAC-SHA256.
 * No external JWT library needed — just stdlib.
 */
public class JwtUtil {

    private static final String SECRET = "GreenCampus-Demo-Secret-Key-2025-Change-In-Production-!";
    private static final long EXPIRY_MS = 24 * 60 * 60 * 1000L; // 24h

    public static String create(String username, String role) {
        long now = System.currentTimeMillis();
        long exp = now + EXPIRY_MS;

        String header = base64("""
                {"alg":"HS256","typ":"JWT"}""");
        String payload = base64("""
                {"sub":"%s","role":"%s","iat":%d,"exp":%d}""".formatted(username, role, now / 1000, exp / 1000));

        String sig = sign(header + "." + payload);
        return header + "." + payload + "." + sig;
    }

    public static String validateAndGetSubject(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3)
            return null;

        String expectedSig = sign(parts[0] + "." + parts[1]);
        if (!expectedSig.equals(parts[2]))
            return null;

        String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        // Simple JSON parsing for exp
        int expIdx = payloadJson.indexOf("\"exp\":");
        if (expIdx >= 0) {
            String expStr = payloadJson.substring(expIdx + 6).replaceAll("[^0-9]", "");
            long exp = Long.parseLong(expStr.substring(0, Math.min(expStr.length(), 10)));
            if (exp < System.currentTimeMillis() / 1000)
                return null;
        }

        // Extract sub
        int subIdx = payloadJson.indexOf("\"sub\":\"");
        if (subIdx < 0)
            return null;
        int subEnd = payloadJson.indexOf("\"", subIdx + 7);
        return payloadJson.substring(subIdx + 7, subEnd);
    }

    /**
     * Extract role from Authorization header ("Bearer xxx").
     * Returns null if invalid.
     */
    public static String extractRole(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return null;
        return validateAndGetRole(authHeader.substring(7));
    }

    /**
     * Extract username from Authorization header ("Bearer xxx").
     * Returns null if invalid.
     */
    public static String extractUsername(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return null;
        return validateAndGetSubject(authHeader.substring(7));
    }

    public static String validateAndGetRole(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3)
            return null;

        String expectedSig = sign(parts[0] + "." + parts[1]);
        if (!expectedSig.equals(parts[2]))
            return null;

        String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);

        // Check expiry
        int expIdx = payloadJson.indexOf("\"exp\":");
        if (expIdx >= 0) {
            String expStr = payloadJson.substring(expIdx + 6).replaceAll("[^0-9]", "");
            long exp = Long.parseLong(expStr.substring(0, Math.min(expStr.length(), 10)));
            if (exp < System.currentTimeMillis() / 1000)
                return null;
        }

        // Extract role
        int roleIdx = payloadJson.indexOf("\"role\":\"");
        if (roleIdx < 0)
            return null;
        int roleEnd = payloadJson.indexOf("\"", roleIdx + 8);
        return payloadJson.substring(roleIdx + 8, roleEnd);
    }

    private static String base64(String s) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(s.getBytes(StandardCharsets.UTF_8));
    }

    private static String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
