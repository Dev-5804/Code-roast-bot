interface RateLimitEntry {
    count: number;
    expiresAt: number;
}

const store = new Map<string, RateLimitEntry>();

const MAX = parseInt(process.env.RATE_LIMIT_MAX ?? '10', 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10);

// Global total request cap across all users for the lifetime of the server process
const GLOBAL_MAX = parseInt(process.env.GLOBAL_REQUEST_LIMIT ?? '500', 10);
let globalCount = 0;

export function checkGlobalLimit(): { allowed: boolean; remaining: number } {
    if (globalCount >= GLOBAL_MAX) {
        return { allowed: false, remaining: 0 };
    }
    globalCount += 1;
    return { allowed: true, remaining: GLOBAL_MAX - globalCount };
}

export function checkRateLimit(ip: string): { allowed: boolean } {
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.expiresAt) {
        store.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
        return { allowed: true };
    }

    if (entry.count >= MAX) {
        return { allowed: false };
    }

    entry.count += 1;
    return { allowed: true };
}
