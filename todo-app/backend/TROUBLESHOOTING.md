# Troubleshooting Guide

## Common Issues & Solutions

### 1. **"Cannot find module" Errors**

**Problem**: After converting to TypeScript, getting module not found errors.

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Make sure tsconfig.json includes all source files
# Check "include" field points to src and server.ts
```

---

### 2. **"ts-node" Not Working**

**Problem**: Command `ts-node src/server.ts` fails.

**Solution**:
```bash
# Install ts-node locally (not globally)
npm install --save-dev ts-node

# Make sure @types/node is installed
npm install --save-dev @types/node

# Run with npm script instead
npm run dev
```

---

### 3. **TypeScript Compilation Errors**

**Problem**: `npm run build` fails with type errors.

**Possible Solutions**:

#### Missing Type Definitions
```typescript
// Add @types for external packages
npm install --save-dev @types/express
npm install --save-dev @types/node
npm install --save-dev @types/cors
```

#### Implicit Any Error
```typescript
// Before (Error: Implicit any)
const processMessage = (userId, message) => { ... }

// After (Fixed)
const processMessage = (userId: string, message: string): Promise<ChatResponse> => { ... }
```

#### Missing Interfaces
```typescript
// Add proper interfaces
interface MyType {
  property: string;
}

const obj: MyType = { property: 'value' };
```

---

### 4. **Port Already in Use**

**Problem**: Error - "EADDRINUSE: address already in use :::3000"

**Solution**:
```bash
# Option 1: Change port in .env
PORT=3001

# Option 2: Kill process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Option 3: Kill process using port 3000 (Linux/Mac)
lsof -i :3000
kill -9 <PID>
```

---

### 5. **"Cannot find name 'process'" Error**

**Problem**: TypeScript doesn't recognize `process` global.

**Solution**: Already included, but if error persists:
```typescript
// Option 1: Import from node
import { env } from 'process';

// Option 2: Install @types/node
npm install --save-dev @types/node

// Option 3: Update tsconfig.json
// Make sure "lib": ["ES2020"] is in compilerOptions
```

---

### 6. **Nodemon Not Auto-Reloading**

**Problem**: Changes to .ts files don't trigger restart.

**Solution**:
```json
// Create nodemon.json
{
  "watch": ["src", "server.ts"],
  "ext": "ts",
  "exec": "ts-node",
  "delay": 500
}
```

Or use the npm script:
```bash
npm run dev:watch
```

---

### 7. **Express Types Issues**

**Problem**: Express Request/Response types not recognized.

**Solution**:
```bash
# Install Express types
npm install --save-dev @types/express

# Use proper typing in controllers
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

export const handleChatMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // ...
};
```

---

### 8. **Jest Tests Not Running**

**Problem**: `npm test` fails with TypeScript errors.

**Solution**:
```bash
# Install ts-jest
npm install --save-dev ts-jest

# Verify jest.config.js exists and is configured
# Make sure jest.config.js has:
# preset: 'ts-jest'
# testEnvironment: 'node'

# Run tests with verbose output
npm test -- --verbose
```

---

### 9. **Docker Build Failing**

**Problem**: Docker build fails with TypeScript errors.

**Solution**:
```dockerfile
# Ensure Dockerfile has correct build stage
# Make sure package*.json is copied before npm install
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

Build and test locally first:
```bash
npm run build
docker build -t todo-backend:latest .
```

---

### 10. **"Cannot find name 'module' or 'exports'" Error**

**Problem**: CommonJS modules not recognized.

**Solution**:
```json
// In tsconfig.json, ensure:
{
  "compilerOptions": {
    "module": "commonjs",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

---

### 11. **Environment Variables Undefined**

**Problem**: `process.env.JWT_SECRET` is undefined at runtime.

**Solution**:
```bash
# 1. Create .env file from template
cp .env.example .env

# 2. Add values to .env
JWT_SECRET=your_secret_here
OPENAI_API_KEY=your_api_key_here

# 3. dotenv is loaded at top of config file
import dotenv from 'dotenv';
dotenv.config();

# 4. Make sure to read from config, not process.env directly
import config from './config/environment';
const jwtSecret = config.jwtSecret;
```

---

### 12. **Source Maps Not Working in Debugging**

**Problem**: Can't set breakpoints in TypeScript files during debugging.

**Solution**:
```json
// In tsconfig.json:
{
  "compilerOptions": {
    "sourceMap": true,      // Generate .map files
    "outDir": "./dist",
    "rootDir": "./"
  }
}

// In package.json for debugging:
{
  "scripts": {
    "debug": "ts-node --inspect-brk src/server.ts"
  }
}
```

Then attach debugger to `localhost:9229` in VS Code.

---

### 13. **Performance Issues with Large Projects**

**Problem**: TypeScript compilation is slow.

**Solution**:
```json
// In tsconfig.json:
{
  "compilerOptions": {
    "skipLibCheck": true,         // Skip checking d.ts files
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true
  }
}

// Use incremental compilation:
// Add to tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

---

### 14. **TypeScript Strict Mode Too Strict**

**Problem**: Many compile errors due to strict mode.

**Solution - Short term**:
```json
// Relax strict mode temporarily in tsconfig.json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false
  }
}
```

**Solution - Long term**:
Fix types properly. Use `// @ts-ignore` only as last resort:
```typescript
// @ts-ignore - Justification for why this is necessary
const result = risky_operation();
```

---

### 15. **Import/Export Issues**

**Problem**: Mix of `require()` and `import` statements.

**Solution**: Convert all to ES6 imports/exports:
```typescript
// Before (CommonJS - Don't mix!)
const express = require('express');
module.exports = { handleChatMessage };

// After (ES6 - Consistent)
import express from 'express';
export { handleChatMessage };

// Or default export
export default chatbotService;
```

---

## Getting Help

### Debugging Steps
1. Check error message carefully
2. Look at line number in error
3. Run `npm run build` to see all errors
4. Check tsconfig.json settings
5. Verify all dependencies are installed
6. Check that files exist at correct paths

### Useful Commands
```bash
# Check TypeScript version
npx tsc --version

# Verify type checking without building
npx tsc --noEmit

# See all TypeScript errors
npm run build

# Debug with node inspect
node --inspect-brk dist/server.js

# Check what types are available
npx tsc --listFilesOnly
```

### Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js TypeScript Guide](https://expressjs.com/en/resources/middleware/cors.html)
- [ts-node Documentation](https://typestrong.org/ts-node/)
- [Jest TypeScript Setup](https://jest.io/docs/getting-started#using-typescript)

---

## Quick Reset

If everything is broken, try this:

```bash
# 1. Clean everything
rm -rf node_modules dist package-lock.json

# 2. Reinstall dependencies
npm install

# 3. Try to build
npm run build

# 4. If build works, try dev
npm run dev

# 5. Check health endpoint
curl http://localhost:3000/health
```

---

**Still having issues?** Check the error message, verify dependencies are installed, and ensure .env file is properly configured.
