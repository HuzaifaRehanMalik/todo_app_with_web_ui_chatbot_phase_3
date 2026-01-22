# Chat API Contract

## POST /api/chat

### Description
Endpoint for submitting user messages to the chatbot and receiving AI-generated responses with any performed todo actions.

### Request
**Headers**:
- `Authorization: Bearer {jwt_token}` - Required authentication token
- `Content-Type: application/json` - Required content type

**Body**:
```json
{
  "message": "Natural language message from user",
  "conversationContext": {
    // Optional conversation context
    "sessionId": "unique_session_identifier",
    "previousMessages": [...],
    "lastAction": "..."
  }
}
```

**Validation**:
- `message` is required and must be a non-empty string
- `conversationContext` is optional
- Valid authentication token required

### Response
**Success (200 OK)**:
```json
{
  "responseText": "AI-generated response to user",
  "performedActions": [
    {
      "actionType": "create|update|complete|delete|query",
      "targetTodoId": "optional_todo_id_for_update_delete_query",
      "todoDetails": {
        "title": "optional_todo_title",
        "description": "optional_todo_description",
        "dueDate": "optional_due_date",
        "completed": "boolean_for_complete_action"
      },
      "status": "executed|failed",
      "message": "optional_status_message"
    }
  ],
  "conversationContext": {
    "sessionId": "unique_session_identifier",
    "nextExpectedInput": "optional_hint_for_next_input",
    "contextData": {}
  },
  "metadata": {
    "requestId": "unique_request_identifier",
    "timestamp": "ISO_8601_timestamp",
    "processingTimeMs": 123
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format or missing required fields
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User lacks permission for requested action
- `500 Internal Server Error`: Unexpected server error during processing

### Security
- All requests must include valid JWT authentication token
- Users can only operate on their own data
- AI credentials are securely handled server-side
- Rate limiting applied to prevent abuse