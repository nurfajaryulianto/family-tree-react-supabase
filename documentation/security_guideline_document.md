# Security Guidelines for Family Tree React Supabase Application

This document outlines the security principles and best practices for the **Family Tree React Supabase** application. It is designed to ensure robust, end-to-end protection of user data, application logic, and infrastructure. Adhering to these guidelines will help you build and maintain a secure, resilient, and trustworthy system.

---

## 1. Authentication & Access Control

•  **Supabase Auth Integration**
   – Enforce strong password policies (minimum length, complexity, no common words).  
   – Use bcrypt or Argon2 for any additional hashing if handling passwords outside Supabase.  
   – Enable Multi-Factor Authentication (MFA) for sensitive actions and privileged accounts.  
   – Rotate API keys and service role keys regularly; store them securely (e.g., HashiCorp Vault).

•  **Session Management**
   – Use short-lived JWTs (e.g., 15–30 minutes) with refresh tokens.  
   – Securely store tokens in HttpOnly, Secure, SameSite=strict cookies.  
   – Implement idle and absolute session timeouts.  
   – Invalidate sessions on logout and critical account changes (e.g., password reset).

•  **Role-Based Access Control (RBAC)**
   – Define clear roles (e.g., `admin`, `editor`, `viewer`) in Supabase RLS policies.  
   – Apply row‐level security (RLS) to restrict access: only owners or invited collaborators may read or write specific family trees.  
   – Validate user roles and claims on every Edge Function and client API call.

---

## 2. Input Handling & Processing

•  **Prevent Injection Attacks**
   – Use Supabase client libraries and parameterized queries for all database operations.  
   – Never interpolate user input directly into SQL strings.  
   – Validate JSON and file inputs against strict schemas (e.g., Zod).

•  **Cross-Site Scripting (XSS)**
   – Sanitize and encode all user-supplied content before rendering.  
   – Use React’s built-in escaping and avoid `dangerouslySetInnerHTML` unless absolutely necessary with sanitized HTML.  
   – Deploy a strong Content Security Policy (CSP) via HTTP headers.

•  **Secure File Uploads**
   – Restrict file types and extensions (e.g., `.jpg`, `.png`, `.pdf`).  
   – Enforce maximum file sizes.  
   – Scan uploads for malware (e.g., ClamAV).  
   – Store files in Supabase Storage with non‐guessable paths and private access by default.  
   – Generate time-limited, signed download URLs for file retrieval.

•  **Redirect and Forward Validation**
   – Maintain an allow-list of legitimate redirect URIs.  
   – Reject any redirect target not on the allow-list.

---

## 3. Data Protection & Privacy

•  **Encryption in Transit & At Rest**
   – Enforce HTTPS (TLS 1.2+) for all front-end, API, and Edge Function endpoints.  
   – Ensure Supabase database and storage use at-rest encryption (AES-256).  
   – Rotate TLS certificates regularly; disable weak ciphers and protocols (SSLv3, TLS 1.0/1.1).

•  **Sensitive Data Handling**
   – Do not store PII or secrets in plaintext.  
   – Mask sensitive fields (e.g., SSNs, credit card numbers) in logs and UIs.  
   – Purge or archive user data in compliance with GDPR/CCPA requirements upon request.

•  **Secrets Management**
   – Use a dedicated secrets management solution for API keys, database credentials, and third-party integrations.  
   – Never commit secrets into source control.  
   – Limit secret access to only the services or functions that require them (least privilege).

---

## 4. API & Service Security

•  **HTTPS & CORS**
   – Serve all API endpoints over HTTPS.  
   – Configure CORS to only allow trusted origins (e.g., your domain and staging domain).

•  **Rate Limiting & Throttling**
   – Implement rate limits on Edge Functions and Supabase REST endpoints to mitigate brute-force and DoS attacks.  
   – Return standard `429 Too Many Requests` responses when limits are exceeded.

•  **Authentication & Authorization**
   – Require valid JWTs on all protected endpoints.  
   – Verify token signatures and expiration (`exp`) on every request.  
   – Reject the `none` algorithm or mismatched algorithms.

•  **API Versioning**
   – Namespace endpoints by version (e.g., `/v1/tree`, `/v2/tree`) to manage changes securely.

•  **Least Privilege on Service Roles**
   – Use distinct Supabase service roles with only the permissions needed by each Edge Function.

---

## 5. Web Application Security Hygiene

•  **CSRF Protection**
   – Use anti-CSRF tokens (synchronizer token pattern) for all state-changing requests initiated from the browser.  
   – Reject requests missing or with invalid tokens.

•  **Security Headers**
   – Content-Security-Policy: restrict sources for scripts, styles, images.  
   – Strict-Transport-Security: `max-age=31536000; includeSubDomains; preload`.  
   – X-Frame-Options: `DENY` or CSP `frame-ancestors 'none'`.  
   – X-Content-Type-Options: `nosniff`.  
   – Referrer-Policy: `no-referrer-when-downgrade` or stricter.

•  **Secure Cookies**
   – Set `HttpOnly`, `Secure`, and `SameSite=Strict` on all cookies storing session or CSRF tokens.

•  **Subresource Integrity (SRI)**
   – Add integrity hashes when loading third-party scripts or styles from CDNs.

---

## 6. Infrastructure & Configuration Management

•  **Server and Database Hardening**
   – Disable unused Supabase features and default admin accounts.  
   – Restrict database network access by IP or VPC rules.

•  **Configuration as Code**
   – Store infrastructure definitions (IaC) in version control.  
   – Use environment-specific configurations with secure defaults in production.

•  **Patch Management**
   – Keep all dependencies, Docker base images, and underlying servers up to date.  
   – Automate vulnerability scans (e.g., Dependabot, Snyk) and promptly apply patches.

•  **Logging & Monitoring**
   – Collect audit logs for auth events, RLS policy violations, Edge Function errors, and storage accesses.  
   – Monitor logs for suspicious patterns and integrate with SIEM or alerting tools.

---

## 7. Dependency Management

•  **Secure Dependencies**
   – Choose libraries with active maintenance and a strong security track record.  
   – Review transitive dependencies as part of pull requests.

•  **Vulnerability Scanning**
   – Integrate SCA tools into CI pipeline to detect known CVEs in `package-lock.json` or `yarn.lock`.

•  **Lockfiles & Pinning**
   – Commit lockfiles to ensure consistent, reproducible builds.  
   – Pin critical dependencies to specific, audited versions.

•  **Minimize Attack Surface**
   – Only install necessary libraries.  
   – Remove or disable development-only dependencies in production builds.

---

## 8. Mobile Application Security (Android via Capacitor)

•  **WebView Hardening**
   – Disable file:// access and JavaScript interfaces unless required.  
   – Enforce HTTPS for all network calls from the WebView.

•  **Secure Storage**
   – Use OS-level encrypted storage (e.g., Android Keystore) for any locally cached sensitive data.

•  **PWA Considerations**
   – Leverage service workers securely: validate requests, sanitize cacheable content, and limit offline capability to non-sensitive flows.

---

## 9. DevOps & CI/CD Security

•  **Secrets in CI/CD**
   – Inject secrets at runtime using secure vault integrations; avoid environment files in repos.  
   – Rotate CI credentials regularly.

•  **Static Analysis & Tests**
   – Enforce linting and static security analysis (e.g., ESLint-with-security-rules).  
   – Include security-focused unit and integration tests (e.g., verify RLS policies, Edge Function auth checks).

•  **Artifact Signing & Attestation**
   – Sign container images or build artifacts to ensure integrity.

•  **Immutable Infrastructure**
   – Deploy using blue/green or canary strategies to minimize impact of a faulty release.

---

By following these guidelines, the **Family Tree React Supabase** application will uphold the highest standards of security, privacy, and resilience. Regularly review and update these practices as the threat landscape and technology stack evolve.