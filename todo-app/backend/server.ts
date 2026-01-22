/**
 * Main Server Entry Point
 * Sets up the Express server with chatbot functionality
 */

import dotenv from 'dotenv';
import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';

dotenv.config();

// Import configuration
import config from './src/config/environment';

// Import routes
import chatRoutes from './src/routes/chat.routes';

// Import middleware
import { globalErrorHandler } from './src/utils/errorHandler';
import Logger from './src/utils/logger';

// Initialize Express app
const app: Express = express();

// Enable CORS
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials
  })
);

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  Logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/chat', chatRoutes);

// Serve static files if needed
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler (should be last middleware)
app.use(globalErrorHandler);

// Start the server
const PORT = config.port;
app.listen(PORT, () => {
  Logger.info(`Server running on port ${PORT}`, {
    environment: config.nodeEnv,
    apiUrl: `/api`,
    version: '1.0.0'
  });
});

export default app;
