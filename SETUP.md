# Setup Instructions

## Quick Start

### 1. Install Dependencies

**Using npm:**
```bash
npm install
```

**Using pnpm:**
```bash
pnpm install
```

### 2. Environment Variables

Copy the example environment file:
```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration (optional for development).

### 3. Run Development Server

**Using npm:**
```bash
npm run dev
```

**Using pnpm:**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Verification Checklist

After installation, verify:

- [ ] No errors in terminal during `npm install` / `pnpm install`
- [ ] `npm run dev` starts without errors
- [ ] Browser opens and shows the home page
- [ ] No console errors in browser DevTools
- [ ] Counter example works (increment/decrement buttons)
- [ ] MUI theme colors are visible (blue primary color)
- [ ] TypeScript compilation works: `npm run type-check`

## Troubleshooting

### Module Not Found Errors
If you see "Cannot find module" errors:
1. Delete `node_modules` folder
2. Delete `package-lock.json` or `pnpm-lock.yaml`
3. Run `npm install` or `pnpm install` again

### TypeScript Errors
If TypeScript shows errors about missing types:
1. Ensure all dependencies are installed
2. Run `npm run type-check` to see detailed errors
3. Check that `@types/node`, `@types/react`, `@types/react-dom` are installed

### Port Already in Use
If port 3000 is already in use:
```bash
# Kill process on port 3000 (Linux/Mac)
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

## Next Steps

1. Review the README.md for architecture overview
2. Check SECURITY.md for security best practices
3. Customize theme in `src/core/theme/tokens.ts`
4. Add your UI components based on the design provided

