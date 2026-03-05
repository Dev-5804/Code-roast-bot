interface RateLimitEntry {
    count: number;
    expiresAt: number;
}

const store = new Map<string, RateLimitEntry>();

const MAX = parseInt(process.env.RATE_LIMIT_MAX ?? '10', 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10);

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
