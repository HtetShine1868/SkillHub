package com.example.backend.auth.security;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory login/register throttle. Keys are IP + email so one attacker
 * cannot spray the same account from many IPs without each IP hitting the cap.
 */
@Service
public class AuthRateLimitService {

    private static final int MAX_FAILURES = 5;
    private static final long WINDOW_MS = 15 * 60 * 1000L;
    private static final int MAX_REQUESTS_PER_MINUTE = 10;
    private static final long MINUTE_MS = 60_000L;

    private final Map<String, Window> failures = new ConcurrentHashMap<>();
    private final Map<String, Window> requests = new ConcurrentHashMap<>();

    public void assertAllowed(String clientIp, String email) {
        prune(failures);
        prune(requests);

        String failKey = key(clientIp, email);
        String ipKey = clientIp == null ? "unknown" : clientIp;

        Window req = requests.computeIfAbsent(ipKey, k -> new Window());
        synchronized (req) {
            long now = System.currentTimeMillis();
            if (now - req.startedAt > MINUTE_MS) {
                req.startedAt = now;
                req.count = 0;
            }
            req.count++;
            if (req.count > MAX_REQUESTS_PER_MINUTE) {
                throw tooMany("Too many login attempts. Wait a minute and try again.");
            }
        }

        Window fail = failures.get(failKey);
        if (fail != null) {
            synchronized (fail) {
                long now = System.currentTimeMillis();
                if (now - fail.startedAt <= WINDOW_MS && fail.count >= MAX_FAILURES) {
                    throw tooMany("Too many failed logins. Try again in 15 minutes.");
                }
            }
        }
    }

    public void recordFailure(String clientIp, String email) {
        String failKey = key(clientIp, email);
        Window fail = failures.computeIfAbsent(failKey, k -> new Window());
        synchronized (fail) {
            long now = System.currentTimeMillis();
            if (now - fail.startedAt > WINDOW_MS) {
                fail.startedAt = now;
                fail.count = 0;
            }
            fail.count++;
        }
    }

    public void recordSuccess(String clientIp, String email) {
        failures.remove(key(clientIp, email));
    }

    private static ResponseStatusException tooMany(String message) {
        return new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, message);
    }

    private static String key(String ip, String email) {
        String safeEmail = email == null ? "" : email.trim().toLowerCase();
        return (ip == null ? "unknown" : ip) + "|" + safeEmail;
    }

    private static void prune(Map<String, Window> map) {
        if (map.size() < 2000) {
            return;
        }
        long now = System.currentTimeMillis();
        Iterator<Map.Entry<String, Window>> it = map.entrySet().iterator();
        while (it.hasNext()) {
            Window w = it.next().getValue();
            if (now - w.startedAt > WINDOW_MS) {
                it.remove();
            }
        }
    }

    private static final class Window {
        long startedAt = System.currentTimeMillis();
        int count;
    }
}
