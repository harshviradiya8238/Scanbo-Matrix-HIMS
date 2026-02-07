# Scanbo HIMS - Enterprise Next.js Application

A production-ready, enterprise-grade Next.js application scaffold with Material UI, Redux Toolkit, and comprehensive security, internationalization, and customization features.

## 🚀 Project Creation Commands

### Using npm:
```bash
npm install
```

### Using pnpm:
```bash
pnpm install
```

## 📦 Dependencies

### Required Dependencies:
- **next** (14.0.4) - Next.js framework with App Router
- **react** (^18.2.0) - React library
- **react-dom** (^18.2.0) - React DOM
- **@mui/material** (^5.15.0) - Material UI component library
- **@mui/icons-material** (^5.15.0) - Material UI icons
- **@emotion/react** (^11.11.1) - Emotion styling engine (required by MUI)
- **@emotion/styled** (^11.11.0) - Emotion styled components
- **@emotion/cache** (^11.11.0) - Emotion cache for SSR
- **@reduxjs/toolkit** (^2.0.1) - Redux Toolkit for state management
- **react-redux** (^9.0.4) - React bindings for Redux
- **zod** (^3.22.4) - Schema validation for environment variables and input

### Development Dependencies:
- **typescript** (^5) - TypeScript compiler
- **@types/node** (^20) - Node.js type definitions
- **@types/react** (^18) - React type definitions
- **@types/react-dom** (^18) - React DOM type definitions
- **eslint** (^8) - Linting
- **eslint-config-next** (14.0.4) - Next.js ESLint config

### Rationale:
- **Zod**: Provides runtime validation for environment variables, preventing configuration errors at build time
- **@mui/icons-material**: Essential for professional UI with consistent iconography
- All other dependencies are core requirements for the stack

## 📁 Final File Tree

```
scanbo-hims/
├── app/
│   ├── layout.tsx                    # Root layout with providers and error boundary
│   └── page.tsx                      # Enhanced example home page
├── src/
│   ├── application/                  # Application Services Layer
│   │   └── counter/
│   │       └── counter-service.ts    # Counter application service
│   ├── components/                   # Legacy components (being migrated)
│   │   └── providers/
│   │       ├── ThemeRegistry.tsx     # MUI theme provider (SSR-safe)
│   │       └── ReduxProvider.tsx     # Redux store provider
│   ├── core/                         # Core Infrastructure
│   │   ├── config/
│   │   │   ├── env.ts                # Environment variable validation
│   │   │   └── feature-flags.ts      # Feature flag system
│   │   ├── i18n/                     # Internationalization
│   │   │   ├── types.ts              # i18n types
│   │   │   ├── index.ts              # i18n utilities and formatting
│   │   │   └── locales/
│   │   │       └── en.ts             # English translations
│   │   ├── security/                 # Security Module
│   │   │   ├── api-client.ts         # Secure API client
│   │   │   ├── csp.ts                # Content Security Policy
│   │   │   └── validation.ts         # Input validation utilities
│   │   └── theme/                    # Theme System
│   │       ├── tokens.ts             # Design tokens with customization
│   │       └── mui-theme.ts         # MUI theme factory
│   ├── domain/                       # Domain Layer (Business Logic)
│   │   └── counter/
│   │       ├── entities/
│   │       │   └── counter.ts        # Counter domain entity and rules
│   │       └── repositories/
│   │           └── counter-repository.ts  # Repository interface
│   ├── lib/                          # Infrastructure Utilities
│   │   └── emotion-cache.ts          # Emotion cache setup for SSR
│   ├── store/                        # Redux Store
│   │   ├── hooks.ts                  # Typed Redux hooks
│   │   ├── store.ts                  # Store configuration
│   │   ├── slices/
│   │   │   └── counterSlice.ts       # Counter Redux slice
│   │   └── thunks/
│   │       └── counter-thunks.ts     # Async thunks using services
│   └── ui/                           # UI Components
│       └── components/
│           ├── ErrorBoundary.tsx      # Error boundary component
│           └── LoadingSpinner.tsx    # Loading spinner component
├── .env.example                      # Environment variable template
├── .gitignore
├── next.config.js                    # Next.js config with security headers
├── package.json
├── README.md
└── tsconfig.json
```

## 📝 Code Files

### `package.json`
```json
{
  "name": "scanbo-hims",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@emotion/cache": "^11.11.0",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@reduxjs/toolkit": "^2.0.1",
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-redux": "^9.0.4",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.0.4",
    "typescript": "^5"
  }
}
```

### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### `src/core/config/env.ts`
```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Scanbo HIMS'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_TIMEOUT: z.coerce.number().default(30000),
  NEXT_PUBLIC_FEATURE_FLAGS: z.string().optional(),
  NEXT_PUBLIC_TENANT_ID: z.string().optional(),
  NEXT_PUBLIC_REGION: z.string().default('us-east-1'),
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT,
  NEXT_PUBLIC_FEATURE_FLAGS: process.env.NEXT_PUBLIC_FEATURE_FLAGS,
  NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID,
  NEXT_PUBLIC_REGION: process.env.NEXT_PUBLIC_REGION,
  NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
});

export type Env = z.infer<typeof envSchema>;
```

### `src/core/theme/tokens.ts`
See full file in project - contains design tokens with tenant/region override support.

### `src/core/security/api-client.ts`
See full file in project - secure API client with CSRF protection, timeout, and SSRF prevention.

### `src/domain/counter/entities/counter.ts`
See full file in project - pure domain logic with business rules.

### `src/application/counter/counter-service.ts`
See full file in project - application service orchestrating domain and repository.

### `app/layout.tsx`
```typescript
import type { Metadata } from 'next';
import ThemeRegistry from '@/src/components/providers/ThemeRegistry';
import ReduxProvider from '@/src/components/providers/ReduxProvider';
import { ErrorBoundary } from '@/src/ui/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Scanbo HIMS - Healthcare Information Management System',
  description: 'Enterprise-grade healthcare information management system',
  // ... additional metadata
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body>
        <ErrorBoundary>
          <ReduxProvider>
            <ThemeRegistry>{children}</ThemeRegistry>
          </ReduxProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

## 🏃 Run Instructions

### Development Mode

**Using npm:**
```bash
npm install
npm run dev
```

**Using pnpm:**
```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

**Using npm:**
```bash
npm run build
npm start
```

**Using pnpm:**
```bash
pnpm build
pnpm start
```

### Type Checking
```bash
npm run type-check
# or
pnpm type-check
```

## 🎨 Customization Guide

### Theme Customization

#### 1. **Design Tokens** (`src/core/theme/tokens.ts`)
Modify `defaultTokens` to change global design:
```typescript
export const defaultTokens: ThemeTokens = {
  colors: {
    primary: { main: '#2AA7D6', dark: '#1F7EA4', light: '#7ED3F0' },
    // ... customize colors
  },
  spacing: { unit: 8, /* ... */ },
  // ... customize other tokens
};
```

#### 2. **Tenant-Specific Themes**
Override in `getTenantTokens()`:
```typescript
function getTenantTokens(tenantId?: string): Partial<ThemeTokens> {
  const tenantOverrides: Record<string, Partial<ThemeTokens>> = {
    'tenant-1': {
      colors: { primary: { main: '#CUSTOM_COLOR' } },
    },
  };
  return tenantOverrides[tenantId || ''] || {};
}
```

#### 3. **Region-Specific Themes**
Override in `getRegionTokens()`:
```typescript
function getRegionTokens(region: string): Partial<ThemeTokens> {
  const regionOverrides: Record<string, Partial<ThemeTokens>> = {
    'eu-west-1': { spacing: { md: '20px' } },
  };
  return regionOverrides[region] || {};
}
```

### Feature Flags

#### 1. **Add New Feature Flag** (`src/core/config/feature-flags.ts`)
```typescript
export interface FeatureFlags {
  enableNewFeature: boolean; // Add here
}

const defaultFlags: FeatureFlags = {
  enableNewFeature: false, // Set default
};
```

#### 2. **Environment-Based Flags**
Set in `.env`:
```bash
NEXT_PUBLIC_FEATURE_FLAGS=enableNewFeature:true,enableBeta:false
```

#### 3. **Use in Components**
```typescript
const flags = getFeatureFlags();
if (flags.enableNewFeature) {
  // Show feature
}
```

### Environment Configuration

#### 1. **Add New Environment Variable** (`src/core/config/env.ts`)
```typescript
const envSchema = z.object({
  // ... existing
  NEXT_PUBLIC_NEW_VAR: z.string().optional(),
});
```

#### 2. **Access in Code**
```typescript
import { env } from '@/src/core/config/env';
const value = env.NEXT_PUBLIC_NEW_VAR;
```

### Internationalization

#### 1. **Add Translation Key** (`src/core/i18n/types.ts` & `locales/en.ts`)
```typescript
// types.ts
export interface TranslationKeys {
  common: {
    newKey: string;
  };
}

// locales/en.ts
export const en: TranslationKeys = {
  common: {
    newKey: 'New Translation',
  },
};
```

#### 2. **Use in Components**
```typescript
import { t } from '@/src/core/i18n';
<Typography>{t('common.newKey')}</Typography>
```

#### 3. **Add New Locale**
1. Create `src/core/i18n/locales/es.ts` (for Spanish)
2. Add translations
3. Register in `src/core/i18n/index.ts`:
```typescript
const translations: Record<Locale, TranslationKeys> = {
  en,
  es, // Add here
};
```

## 🔒 Security Checklist

### ✅ Security Headers
- [x] Strict-Transport-Security (HSTS) configured
- [x] X-Frame-Options set to SAMEORIGIN
- [x] X-Content-Type-Options set to nosniff
- [x] X-XSS-Protection enabled
- [x] Referrer-Policy configured
- [x] Permissions-Policy configured
- [x] Content-Security-Policy configured (adjust for your CDN/analytics)

### ✅ Environment Variables
- [x] Environment variables validated with Zod
- [x] No secrets in client-side code (only NEXT_PUBLIC_* vars exposed)
- [x] `.env.example` provided as template
- [ ] Server-side secrets stored securely (use Vercel/env vars, AWS Secrets Manager, etc.)

### ✅ Input Validation
- [x] Zod schemas for validation
- [x] `sanitizeInput()` function for XSS prevention
- [x] API client validates URLs (SSRF prevention)
- [ ] Add validation to all user inputs in production

### ✅ API Security
- [x] Secure API client with timeout
- [x] CSRF token support (implement token generation/validation)
- [x] SSRF prevention (URL validation)
- [ ] Implement proper authentication/authorization
- [ ] Rate limiting on API endpoints
- [ ] Request signing for sensitive operations

### ✅ Code Security
- [x] TypeScript strict mode enabled
- [x] No `eval()` or `dangerouslySetInnerHTML` without sanitization
- [x] Error boundaries to prevent information leakage
- [ ] Regular dependency audits (`npm audit`)
- [ ] Code scanning in CI/CD

### ⚠️ Security Considerations for Production

1. **CSRF Protection**: Implement proper CSRF token generation and validation
   - Generate tokens server-side
   - Store in httpOnly cookies
   - Validate on state-changing requests

2. **Authentication**: Add authentication system
   - Use NextAuth.js or similar
   - Implement session management
   - Secure cookie settings (httpOnly, secure, sameSite)

3. **CSP Adjustments**: Modify CSP for:
   - CDN domains (for assets)
   - Analytics services
   - Third-party APIs
   - WebSocket connections

4. **Rate Limiting**: Implement on API routes
   - Use middleware or API gateway
   - Per-IP and per-user limits

5. **Secrets Management**: Never commit secrets
   - Use environment variables
   - Use secret management services
   - Rotate secrets regularly

6. **Dependency Security**: Regular updates
   - `npm audit` regularly
   - Automated dependency updates (Dependabot)
   - Keep dependencies current

## ✅ Self-Check Checklist

### ✅ Compilation & Build
- [ ] Project compiles without TypeScript errors (`npm run build`)
- [ ] No linter errors (`npm run lint`)
- [ ] All imports resolve correctly
- [ ] Type checking passes (`npm run type-check`)

### ✅ SSR-Safe MUI Setup
- [ ] Emotion cache configured with insertion point
- [ ] `ThemeRegistry` uses `CacheProvider`
- [ ] `CssBaseline` included
- [ ] No hydration mismatches in console
- [ ] Styles render on initial load (no FOUC)

### ✅ Theme Applied
- [ ] Primary color (#2AA7D6) visible
- [ ] Background color (#EAF7FD) applied
- [ ] Text colors correct
- [ ] Border radius applied (10px buttons, 12px cards)
- [ ] Component overrides work

### ✅ Redux Works
- [ ] Counter displays correctly
- [ ] Increment/decrement work
- [ ] Reset works
- [ ] Custom amount input works
- [ ] No Redux errors in console
- [ ] Redux DevTools connect (if installed)

### ✅ Architecture
- [ ] Domain logic separated from UI
- [ ] Application services orchestrate correctly
- [ ] Repository pattern implemented
- [ ] No business logic in components

### ✅ Security
- [ ] Security headers present (check Network tab)
- [ ] Environment variables validated
- [ ] No secrets in client bundle
- [ ] Input validation works
- [ ] API client handles errors

### ✅ Internationalization
- [ ] Translations load correctly
- [ ] `t()` function works
- [ ] Number formatting works
- [ ] Date formatting works
- [ ] Currency formatting works

### ✅ Feature Flags
- [ ] Feature flags load correctly
- [ ] Environment-based flags work
- [ ] Tenant overrides work (if implemented)
- [ ] Region overrides work

### ✅ Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Screen reader friendly
- [ ] Color contrast meets WCAG AA

### ✅ Error Handling
- [ ] Error boundary catches errors
- [ ] Error messages user-friendly
- [ ] Loading states work
- [ ] Network errors handled gracefully

## 🏗️ Architecture Overview

### Layered Architecture

1. **UI Layer** (`src/ui/`, `app/`)
   - React components
   - MUI components
   - No business logic

2. **Application Layer** (`src/application/`)
   - Application services
   - Orchestrates domain and infrastructure
   - Use cases

3. **Domain Layer** (`src/domain/`)
   - Business entities
   - Business rules
   - Pure TypeScript (no framework dependencies)

4. **Infrastructure Layer** (`src/core/`, `src/lib/`)
   - External services
   - Configuration
   - Security
   - i18n

### State Management

- **Redux Toolkit** for global state
- **Domain-driven** state structure
- **Thunks** for async operations using application services
- **Typed hooks** for type safety

### Data Flow

```
UI Component → Redux Action/Thunk → Application Service → Domain Entity → Repository
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Material UI Documentation](https://mui.com/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Zod Documentation](https://zod.dev/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## 🤝 Contributing

This is an enterprise scaffold. When extending:

1. Follow the layered architecture
2. Keep business logic in domain layer
3. Use application services for orchestration
4. Validate all inputs
5. Add tests for business logic
6. Update documentation

## 📄 License

Proprietary - Scanbo HIMS
