# Quickstart Guide: Chatbot Feature for Todo Management

## Prerequisites
- Node.js v18+ installed
- npm or yarn package manager
- Access to AI service API key (OpenAI or equivalent)
- Existing todo application backend and frontend setup

## Setup Instructions

### 1. Environment Configuration
1. Copy `.env.example` to `.env` in both backend and frontend directories
2. Add your AI service API key to the backend `.env` file:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
3. Configure any other required environment variables

### 2. Backend Setup
1. Navigate to the backend directory: `cd todo-app/backend`
2. Install dependencies: `npm install`
3. Add the new chatbot routes to your application:
   ```javascript
   const chatRoutes = require('./routes/chat.routes');
   app.use('/api', chatRoutes);
   ```
4. Start the backend server: `npm start`

### 3. Frontend Setup
1. Navigate to the frontend directory: `cd todo-app/frontend`
2. Install dependencies: `npm install`
3. Add the chatbot component to your main application:
   ```jsx
   import ChatbotInterface from './components/ChatbotInterface';

   // Add to your main App component
   <div className="app-container">
     {/* Your existing todo components */}
     <ChatbotInterface />
   </div>
   ```
4. Start the frontend: `npm start`

### 4. Integration Points
1. The chatbot component communicates with the backend via the `/api/chat` endpoint
2. Real-time updates are handled via Socket.IO connections
3. Authentication tokens are passed with each chat request
4. Todo changes made via chat are reflected immediately in the UI

## Usage
1. Open the application in your browser
2. Authenticate with your user account
3. Click the chatbot toggle in the lower-left corner to open the chat interface
4. Type natural language commands like:
   - "Add buy groceries to my todos"
   - "Show me my todos"
   - "Mark the first task as complete"
5. Observe real-time updates to your todo list as actions are performed

## Testing
- Unit tests: `npm test` in both backend and frontend directories
- Integration tests: `npm run test:integration`
- Manual testing: Use the chat interface to perform various todo operations