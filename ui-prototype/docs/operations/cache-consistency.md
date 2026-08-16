# Cache consistency policy

TaskFlow currently has no Redis/shared application cache. Authenticated API responses use `Cache-Control: no-store`; PostgreSQL remains the source of truth. This intentionally avoids stale tenant permissions, subscription state, payment state, and private task data.

Any future cache entry needs a named owner, tenant + actor + permission-version key, TTL of at most five minutes, invalidation event, stale policy, negative-cache TTL of at most 15 seconds, and a tested fallback. Permission, session, balance, and payment state must not use shared response caching.

Use request coalescing and jittered TTL before adding capacity. If Redis is unavailable, open a circuit breaker and either fall back to a bounded database query or fail closed according to the registered policy; never fan an unbounded retry storm into PostgreSQL. `app/lib/cache-policy.ts` enforces the key context and prohibited domains.
