# Data Model: Chatbot Feature for Todo Management

## Entity: ChatMessage
- **Fields**:
  - id: String (unique identifier)
  - userId: String (foreign key to user)
  - messageText: String (the natural language input from user)
  - timestamp: DateTime (when message was sent)
  - conversationContext: Object (optional context from previous interactions)
  - status: Enum ['received', 'processing', 'processed', 'error']

- **Validation rules**:
  - messageText must not be empty
  - userId must be valid and authenticated
  - timestamp must be current or past

- **Relationships**:
  - Belongs to one User
  - May trigger zero or more TodoActions

## Entity: TodoAction
- **Fields**:
  - id: String (unique identifier)
  - chatMessageId: String (foreign key to ChatMessage that triggered this action)
  - actionType: Enum ['create', 'update', 'complete', 'delete', 'query']
  - targetTodoId: String (optional, for update/delete/query actions)
  - todoDetails: Object (for create/update actions - contains title, description, dueDate, etc.)
  - status: Enum ['pending', 'executed', 'failed']
  - executedAt: DateTime (when action was executed)

- **Validation rules**:
  - actionType must be valid enum value
  - If actionType is update/delete/query, targetTodoId must exist and belong to the same user
  - If actionType is create, todoDetails must be provided

- **Relationships**:
  - Belongs to one ChatMessage
  - May affect zero or one Todo item
  - Belongs to one User (via ChatMessage)

## Entity: ChatResponse
- **Fields**:
  - id: String (unique identifier)
  - chatMessageId: String (foreign key to ChatMessage)
  - responseText: String (AI-generated response)
  - performedActions: Array of TodoAction IDs (actions that were executed)
  - metadata: Object (additional information like confidence scores, processing time)
  - timestamp: DateTime (when response was generated)

- **Validation rules**:
  - responseText must not be empty
  - chatMessageId must reference an existing ChatMessage
  - performedActions must reference valid TodoAction IDs belonging to the same user

- **Relationships**:
  - Belongs to one ChatMessage
  - References zero or more TodoActions
  - Belongs to one User (via ChatMessage)

## State Transitions

### ChatMessage States
- `received` → `processing` → `processed` (successful processing)
- `received` → `processing` → `error` (failed processing)

### TodoAction States
- `pending` → `executed` (successful execution)
- `pending` → `failed` (execution failed)

## Additional Considerations
- All entities must enforce user isolation - users can only access their own data
- Timestamps should be stored in UTC
- Sensitive data should be encrypted at rest
- Conversation context should have size limitations to prevent excessive storage