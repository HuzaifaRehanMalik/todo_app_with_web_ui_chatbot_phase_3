/**
 * AI Integration Service
 * Handles communication with AI providers (Google Gemini)
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

export interface AIResponse {
  actionType: string;
  targetTodoId?: string | null;
  todoDetails?: Record<string, any>;
  confidence?: number;
  message?: string | null;
  queryType?: string | null;
}

export interface NormalizedResponse extends AIResponse {
  actionType: string;
  targetTodoId: string | null;
  todoDetails: Record<string, any>;
  confidence: number;
  message: string | null;
  queryType: string | null;
}

class AIIntegrationService {
  private apiKey: string | undefined;
  // Gemini's OpenAI-compatible chat completions endpoint
  private apiUrl: string = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
  private model: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  /**
   * Check if the AI service is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Send a message to the AI model and get a response
   */
  async sendMessage(message: string, context: string = ''): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw new Error(
        'AI service is not configured. Please set GEMINI_API_KEY in environment variables.'
      );
    }

    const systemPrompt = `
      You are a helpful todo management assistant. Your role is to interpret natural language input from users and convert it into structured commands for todo management.

      Available actions:
      1. CREATE_TODO: Create a new todo item
      2. QUERY_TODOS: List existing todos
      3. UPDATE_TODO: Update an existing todo
      4. COMPLETE_TODO: Mark a todo as complete
      5. DELETE_TODO: Delete a todo

      Respond in JSON format with the following structure:
      {
        "actionType": "create|query|update|complete|delete",
        "targetTodoId": "optional ID for update/delete/complete actions",
        "todoDetails": {
          "title": "todo title",
          "description": "optional description",
          "dueDate": "optional due date in ISO format",
          "priority": "optional priority (low|medium|high)"
        },
        "confidence": 0.0-1.0
      }

      For queries:
      {
        "actionType": "query",
        "queryType": "all|completed|pending|overdue|by_priority|by_due_date"
      }

      For updates:
      {
        "actionType": "update",
        "targetTodoId": "id of todo to update",
        "todoDetails": {
          "title": "new title (optional)",
          "description": "new description (optional)",
          "dueDate": "new due date (optional)",
          "completed": "true/false (optional)"
        }
      }
    `;

    const payload = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: context ? `${context}\n\nUser message: ${message}` : message
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: 'json_object' }
    };

    try {
      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        timeout: 10000 // 10 second timeout
      });

      const aiResponse = response.data.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from AI service');
      }

      // Parse the JSON response from AI
      let parsedResponse: AIResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.log('Raw AI response:', aiResponse);
        throw new Error('Invalid response format from AI service');
      }

      return parsedResponse;
    } catch (error: any) {
      console.error('Error calling AI service:', error.message);

      // If there's an error, return a default response indicating we couldn't understand
      return {
        actionType: 'unknown',
        confidence: 0.0,
        message: 'Unable to process the request. Please try rephrasing.'
      };
    }
  }

  /**
   * Process a user message using the AI service
   */
  async processUserMessage(message: string): Promise<NormalizedResponse> {
    // First try to extract intent directly from the message without AI if possible
    const directIntent = this.extractDirectIntent(message);

    if (directIntent.confidence > 0.8) {
      // High confidence in direct extraction, return it
      return directIntent;
    }

    // Low confidence in direct extraction, use AI
    const aiResponse = await this.sendMessage(message);

    // Validate and normalize the response
    return this.normalizeResponse(aiResponse);
  }

  /**
   * Try to extract intent directly from the message
   */
  private extractDirectIntent(message: string): NormalizedResponse {
    const lowerMsg = message.toLowerCase().trim();

    // Define patterns for different actions
    const patterns: Record<string, RegExp[]> = {
      create: [
        /add\s+(.+)\s+to\s+my\s+todos?/,
        /create\s+a\s+task\s+to\s+(.+)/,
        /make\s+a\s+note\s+to\s+(.+)/,
        /remind\s+me\s+to\s+(.+)/,
        /don'?t\s+forget\s+to\s+(.+)/,
        /new\s+(.+)$/,
        /add\s+(.+)$/
      ],
      query: [
        /show\s+me\s+my\s+todos?/,
        /what\s+do\s+i\s+need\s+to\s+do/,
        /list\s+my\s+todos?/,
        /what's?\s+on\s+my\s+list/,
        /view\s+my\s+todos?/,
        /my\s+todos?/
      ],
      complete: [
        /complete\s+(.+)/,
        /finish\s+(.+)/,
        /done\s+with\s+(.+)/,
        /mark\s+(.+?)\s+as\s+complete/,
        /check\s+off\s+(.+)/
      ],
      delete: [
        /delete\s+(.+)/,
        /remove\s+(.+)/,
        /get\s+rid\s+of\s+(.+)/,
        /cancel\s+(.+)/
      ]
    };

    // Check for create patterns
    for (const pattern of patterns.create) {
      const match = message.match(pattern);
      if (match) {
        const todoTitle = match[1] || message.replace(/add|create|make|new/i, '').trim();
        return {
          actionType: 'create',
          targetTodoId: null,
          todoDetails: { title: todoTitle },
          confidence: 0.9,
          message: null,
          queryType: null
        };
      }
    }

    // Check for query patterns
    for (const pattern of patterns.query) {
      if (pattern.test(lowerMsg)) {
        return {
          actionType: 'query',
          targetTodoId: null,
          todoDetails: {},
          confidence: 0.9,
          message: null,
          queryType: null
        };
      }
    }

    // Check for complete patterns
    for (const pattern of patterns.complete) {
      const match = message.match(pattern);
      if (match) {
        return {
          actionType: 'complete',
          targetTodoId: null,
          todoDetails: { title: match[1] || message },
          confidence: 0.85,
          message: null,
          queryType: null
        };
      }
    }

    // Check for delete patterns
    for (const pattern of patterns.delete) {
      const match = message.match(pattern);
      if (match) {
        return {
          actionType: 'delete',
          targetTodoId: null,
          todoDetails: { title: match[1] || message },
          confidence: 0.85,
          message: null,
          queryType: null
        };
      }
    }

    // If no pattern matched, return unknown with low confidence
    return {
      actionType: 'unknown',
      targetTodoId: null,
      todoDetails: {},
      confidence: 0.1,
      message: 'Unable to understand the request',
      queryType: null
    };
  }

  /**
   * Normalize the AI response to ensure consistency
   */
  private normalizeResponse(response: AIResponse): NormalizedResponse {
    // Ensure actionType is valid
    const validActionTypes = ['create', 'query', 'update', 'complete', 'delete', 'unknown'];
    const actionType = validActionTypes.includes(response.actionType)
      ? response.actionType
      : 'unknown';

    // Set default confidence if not provided
    const confidence = response.confidence || 0.5;

    return {
      actionType,
      targetTodoId: response.targetTodoId || null,
      todoDetails: response.todoDetails || {},
      confidence,
      message: response.message || null,
      queryType: response.queryType || null
    };
  }
}

export default new AIIntegrationService();
