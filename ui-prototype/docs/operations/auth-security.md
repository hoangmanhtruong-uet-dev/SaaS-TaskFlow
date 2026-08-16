# Authentication security configuration

Owner: Identity Owner. Verify this checklist in each Supabase project before production and after provider configuration changes.

## Provider controls

- Supabase Auth stores salted bcrypt password hashes. Application password creation/reset additionally requires at least 12 characters with lowercase, uppercase, number, and symbol.
- Enable leaked-password protection before production. It requires Supabase Pro; a Free project must not be described as satisfying this control.
- Keep refresh-token rotation and reuse detection enabled with the provider-recommended reuse interval. Set JWT expiry to 10 minutes for production after load testing.
- Configure a 24-hour absolute session time-box and 30-minute inactivity timeout. These managed controls require Supabase Pro. Until enabled, production launch is blocked.
- Keep PKCE OAuth flow and exact redirect URL allowlists. No wildcard production redirect URLs.
- TOTP MFA is enabled. Owner/Admin sensitive mutations require an `aal2` session in the API; enrolled users are routed through the challenge after login.
- Recovery responses stay generic. Password reset revokes other sessions. Users can revoke the current session, all other sessions, or every session.

## Detection and recovery

- Alert on `auth_login_rate_limited`, repeated `auth_login_failed`, MFA rate limits, refresh-token reuse, and sensitive mutations without AAL2.
- On suspected account takeover: revoke all sessions, suspend tenant membership if necessary, force password reset, require MFA enrollment, inspect activity/provider logs, and notify the user.
- Quarterly test: generic unknown-email recovery, login burst, MFA enrollment/challenge, stale recovery link, password reset + other-session revocation, and OAuth redirect allowlist.
