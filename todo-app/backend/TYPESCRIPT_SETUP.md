# Quick Start Guide - TypeScript Backend

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

## Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:
- Set `JWT_SECRET` to a secure random string
- Set `OPENAI_API_KEY` to your OpenAI API key
- Adjust other settings as needed

### 3. Development Mode

Run the server with auto-reload:

```bash
npm run dev:watch
```

The server will start at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm start
```

## Using the Chatbot API

### With Authentication

The chat endpoint requires a Bearer token in the Authorization header.

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Add buy groceries to my todos"}'
```

### Response Example

```json
{
  "responseText": "Okay, I've added \"buy groceries\" to your todos.",
  "performedActions": [
    {
      "id": "action-123",
      "status": "executed"
    }
  ],
  "conversationContext": {
    "sessionId": "session-abc",
    "lastResponse": "Okay, I've added \"buy groceries\" to your todos."
  },
  "metadata": {
    "confidence": 0.9,
    "processingTime": 245
  }
}
```

## Troubleshooting

### TypeScript Compilation Errors

Ensure all types are properly imported. Run:

```bash
npm run build
```

### Missing Dependencies

If you see module not found errors, reinstall dependencies:

```bash
npm install
```

### Port Already in Use

Change the PORT in `.env` to an available port.

## Testing

Run the test suite:

```bash
npm test
```

Watch mode for development:

```bash
npm run test:watch
```

## IDE Setup

### VS Code

Install these extensions for better TypeScript support:
- **TypeScript Vue Plugin** (for Vue support if needed)
- **ESLint**
- **Prettier** (optional but recommended)

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

## Common Commands Summary

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev:watch` | Start dev server with auto-reload |
| `npm run dev` | Start dev server once |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled production build |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |

## Next Steps

1. Integrate with your frontend
2. Set up a database connection (currently using mock data)
3. Configure proper error handling and logging
4. Deploy to your hosting platform

For more details, see [README.md](README.md)
