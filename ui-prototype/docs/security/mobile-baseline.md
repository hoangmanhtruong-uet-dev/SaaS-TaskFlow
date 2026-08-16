# Mobile security release gate

TaskFlow currently ships only a Next.js web client. Section 2.6 is therefore **not applicable to the current release**, not silently satisfied. Any Android/iOS repository or embedded webview must pass this gate before production access.

## Mandatory controls

- Treat the app, device, all route IDs, prices, roles, subscription state, integrity results, and local data as untrusted.
- Embed only public publishable identifiers. Never ship service-role, Stripe secret, webhook, database, signing, or worker credentials.
- Store refresh/session credentials only in Android Keystore-backed storage or iOS Keychain with the strongest practical device-access policy. Do not put credentials in logs, analytics, URL parameters, clipboard, shared preferences, or unprotected backups.
- Enforce tenant, membership, role, object, price, entitlement, and sensitive-field authorization on the server for every request.
- Use platform-supported HTTPS/TLS. Certificate pinning requires an approved threat-model exception, backup pins, expiry monitoring, kill switch, and tested rotation; it is not enabled by default.
- Root/jailbreak, Play Integrity, and App Attest are risk signals. They may trigger step-up authentication or reduced capability but never grant authorization or serve as sole proof of compromise.
- Redact screenshots/app switcher for sensitive screens where justified, validate deep links/universal links, and reject tokens in URLs.
- Define offline-data encryption, cache expiry, logout wipe, device-loss recovery, update policy, and supported OS versions.

## Required evidence

- Static secret scan of the release artifact and source.
- Tests on rooted/jailbroken and normal devices proving server authorization is unchanged.
- Keychain/Keystore extraction and backup/restore tests.
- Deep-link hijack, TLS rotation, offline-cache, logout wipe, and attestation-outage tests.
- Named Mobile Lead and Security reviewer approval recorded in the release checklist.
