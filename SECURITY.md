# Security Guide

## Threat Model - Frontend Security Considerations

### 1. Cross-Site Scripting (XSS)

**Threat**: Malicious scripts injected into the application
**Mitigation**:
- ✅ Input sanitization (`src/core/security/validation.ts`)
- ✅ React's automatic escaping
- ✅ Content Security Policy (CSP) headers
- ⚠️ **Action Required**: Sanitize any `dangerouslySetInnerHTML` usage
- ⚠️ **Action Required**: Validate and sanitize all user inputs before rendering

**Best Practices**:
```typescript
import { sanitizeInput } from '@/src/core/security/validation';

// Always sanitize user input
const safeInput = sanitizeInput(userInput);
```

### 2. Cross-Site Request Forgery (CSRF)

**Threat**: Unauthorized actions performed on behalf of authenticated users
**Mitigation**:
- ✅ CSRF token support in API client
- ⚠️ **Action Required**: Implement CSRF token generation server-side
- ⚠️ **Action Required**: Validate CSRF tokens on state-changing requests
- ⚠️ **Action Required**: Use SameSite cookies

**Implementation Guide**:
1. Generate CSRF token on session creation
2. Store in httpOnly cookie
3. Include in request headers
4. Validate on server-side

### 3. Server-Side Rendering (SSR) Security

**Threat**: Sensitive data exposure, XSS via SSR
**Mitigation**:
- ✅ No secrets in `NEXT_PUBLIC_*` variables
- ✅ Environment variable validation
- ⚠️ **Action Required**: Never pass sensitive data to client components
- ⚠️ **Action Required**: Sanitize data before SSR rendering

**Best Practices**:
```typescript
// ❌ BAD - Secret in client code
const API_KEY = 'secret-key';

// ✅ GOOD - Server-side only
// Use API routes for sensitive operations
```

### 4. Server-Side Request Forgery (SSRF)

**Threat**: Forced server to make requests to internal resources
**Mitigation**:
- ✅ URL validation in API client
- ⚠️ **Action Required**: Whitelist allowed domains in production
- ⚠️ **Action Required**: Block private IP ranges
- ⚠️ **Action Required**: Block localhost in production

### 5. Information Disclosure

**Threat**: Sensitive information in error messages, console logs
**Mitigation**:
- ✅ Error boundaries prevent full stack traces
- ✅ Generic error messages to users
- ⚠️ **Action Required**: Log detailed errors server-side only
- ⚠️ **Action Required**: Remove debug logs in production

### 6. Insecure Dependencies

**Threat**: Vulnerable third-party packages
**Mitigation**:
- ⚠️ **Action Required**: Regular `npm audit`
- ⚠️ **Action Required**: Automated dependency updates
- ⚠️ **Action Required**: Keep dependencies current

## Security Headers

All security headers are configured in `next.config.js`. Review and adjust based on your needs:

- **CSP**: Adjust for CDN, analytics, third-party services
- **HSTS**: Already configured for HTTPS enforcement
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing

## Secure Cookie Configuration

When implementing authentication, use secure cookies:

```typescript
// Example (adjust based on your auth library)
{
  httpOnly: true,      // Prevents JavaScript access
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 86400,       // 24 hours
}
```

## Input Validation Patterns

### Client-Side Validation
```typescript
import { validateInput, validationSchemas } from '@/src/core/security/validation';

const result = validateInput(validationSchemas.email, userInput);
if (!result.success) {
  // Handle error
}
```

### Server-Side Validation
Always validate on the server as well. Client-side validation is for UX only.

## API Security Checklist

- [ ] All API endpoints require authentication
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Output sanitization
- [ ] CORS properly configured
- [ ] Request signing for sensitive operations
- [ ] Audit logging enabled

## Production Security Checklist

- [ ] Remove `console.log` statements
- [ ] Enable production error tracking (Sentry, etc.)
- [ ] Implement proper logging (Winston, Pino, etc.)
- [ ] Set up monitoring and alerting
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] Dependency vulnerability scanning
- [ ] Secrets rotation policy
- [ ] Backup and disaster recovery plan

## Security Incident Response

1. **Identify**: Detect the security issue
2. **Contain**: Limit the impact
3. **Eradicate**: Remove the threat
4. **Recover**: Restore normal operations
5. **Learn**: Post-incident review

## Reporting Security Issues

Report security vulnerabilities responsibly. Do not create public issues for security problems.

