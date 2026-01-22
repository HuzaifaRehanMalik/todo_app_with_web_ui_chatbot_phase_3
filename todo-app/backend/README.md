# Todo Application Backend

A TypeScript-based backend for a todo application with AI chatbot integration built with Express.js, TypeScript, and JWT authentication.

## Features

- ✅ Create, read, update, delete todo items
- ✅ Natural language processing with AI chatbot
- ✅ JWT-based authentication
- ✅ CORS enabled
- ✅ Type-safe with full TypeScript support
- ✅ Async/await patterns

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript 5.3
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken)
- **HTTP Client**: Axios
- **Testing**: Jest with ts-jest
- **Development**: ts-node & nodemon

## Installation

1. Install the required dependencies:
```bash
npm install
```

2. Set up your environment variables:
```bash
cp .env.example .env
```
Then edit the `.env` file with your configuration:
- `JWT_SECRET` - Your JWT secret key
- `OPENAI_API_KEY` - Your OpenAI API key for the chatbot
- `PORT` - Server port (default: 3000)

## Scripts

### Development
```bash
# Run with auto-reload (ts-node + nodemon)
npm run dev:watch

# Run once with ts-node
npm run dev
```

### Production
```bash
# Build TypeScript to JavaScript
npm run build

# Start the compiled application
npm start
```

### Testing
```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Chat/Todo Management
- `POST /api/chat` - Send a message to the chatbot for todo management
- `GET /api/chat/health` - Health check for chat service

## Environment Variables

Create a `.env` file based on `.env.example`:

```
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-3.5-turbo
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_app
DB_USER=postgres
DB_PASSWORD=password
CORS_ORIGIN=*
CORS_CREDENTIALS=true
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── environment.ts       # Configuration management
│   ├── controllers/
│   │   └── chat.controller.ts   # Chat request handlers
│   ├── middleware/
│   │   └── auth.middleware.ts   # JWT authentication
│   ├── models/
│   │   ├── chat-message.model.ts
│   │   ├── chat-response.model.ts
│   │   └── todo-action.model.ts
│   ├── routes/
│   │   └── chat.routes.ts       # Chat routes
│   ├── services/
│   │   ├── ai-integration.service.ts      # AI provider integration
│   │   ├── chatbot.service.ts             # Chatbot logic
│   │   ├── intent-processor.service.ts    # NLP intent extraction
│   │   └── todo-action-executor.service.ts # Action execution
│   └── utils/
│       ├── logger.ts            # Logging utility
│       └── errorHandler.ts      # Error handling
├── server.ts                     # Main entry point
├── tsconfig.json                # TypeScript configuration
├── jest.config.js               # Jest testing configuration
└── package.json                 # Dependencies
```

## Build & Compile

The project is configured with TypeScript strict mode. To compile:

```bash
npm run build
```

This generates the `dist/` directory with compiled JavaScript files.

## Chatbot Features

The chatbot can understand natural language commands for todo management:

- "Add [task] to my todos"
- "Create a task to [task description]"
- "Show me my todos"
- "List my tasks"
- "Mark [task] as complete"
- "Delete [task]"

## License

MIT

The application uses SQLModel with PostgreSQL (Neon DB) to store todo items.