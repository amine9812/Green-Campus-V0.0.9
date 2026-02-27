package com.greencampus.service.chat;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatRateLimiter {

    private static final int USER_LIMIT = 10;
    private static final int IP_LIMIT = 30;
    private static final Duration WINDOW = Duration.ofMinutes(1);

    private final Map<String, Deque<Instant>> userBuckets = new ConcurrentHashMap<>();
    private final Map<String, Deque<Instant>> ipBuckets = new ConcurrentHashMap<>();

    public boolean allowUser(String username) {
        if (username == null || username.isBlank()) {
            return false;
        }
        return allow(userBuckets, "u:" + username, USER_LIMIT);
    }

    public boolean allowIp(String ipAddress) {
        if (ipAddress == null || ipAddress.isBlank()) {
            return false;
        }
        return allow(ipBuckets, "ip:" + ipAddress, IP_LIMIT);
    }

    private boolean allow(Map<String, Deque<Instant>> buckets, String key, int limit) {
        Deque<Instant> deque = buckets.computeIfAbsent(key, k -> new ArrayDeque<>());
        Instant now = Instant.now();
        Instant cutoff = now.minus(WINDOW);

        synchronized (deque) {
            while (!deque.isEmpty() && deque.peekFirst().isBefore(cutoff)) {
                deque.pollFirst();
            }
            if (deque.size() >= limit) {
                return false;
            }
            deque.addLast(now);
            return true;
        }
    }
}
