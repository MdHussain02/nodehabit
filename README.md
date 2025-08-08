# nodehabit

A Node.js backend API for habit tracking with JWT authentication and MongoDB storage.

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user

### Habits
- `POST /api/v1/habits` - Create a new habit (Protected)
- `GET /api/v1/habits` - Get all habits for authenticated user (Protected)
- `GET /api/v1/habits/:id` - Get a specific habit by ID (Protected)

### AI-Powered Suggestions (Powered by Google Gemini)
- `GET /api/v1/suggestions` - Get personalized habit suggestions (Protected)
- `GET /api/v1/suggestions/analysis` - Get habit analysis and insights (Protected)
- `GET /api/v1/suggestions/category/:category` - Get category-specific suggestions (Protected)
- `GET /api/v1/suggestions/goal/:goal` - Get goal-based suggestions (Protected)
- `POST /api/v1/suggestions/create` - Create habit from suggestion (Protected)

### Habits Endpoint Details

#### POST /api/v1/habits
Creates a new habit for the authenticated user.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Morning Exercise",
  "created_time": "2024-01-15T10:30:00.000Z",
  "target_time": "2024-01-15T07:00:00.000Z",
  "icon_id": 1,
  "repeats": [0, 1, 2, 3, 4]
}
```

**Field Descriptions:**
- `name` (string, required): The name of the habit
- `created_time` (string, required): UTC timestamp of when the habit was created
- `target_time` (string, required): UTC timestamp representing the time of day for the habit
- `icon_id` (number, required): Icon identifier for the habit
- `repeats` (array of numbers, required): Days of the week (Monday=0, Tuesday=1, etc.)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Morning Exercise",
    "created_time": "2024-01-15T10:30:00.000Z",
    "target_time": "2024-01-15T07:00:00.000Z",
    "icon_id": 1,
    "repeats": [0, 1, 2, 3, 4],
    "user": "...",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: No valid JWT token provided
- `400 Bad Request`: Missing required fields or invalid data

### AI-Powered Suggestions Endpoint Details

#### GET /api/v1/suggestions
Get personalized habit suggestions based on user profile and existing habits.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `maxSuggestions` (optional): Number of suggestions to generate (default: 5)
- `focusArea` (optional): Focus area for suggestions (default: 'general')
- `category` (optional): Specific category filter

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "name": "Morning Stretching",
        "description": "Gentle stretching to improve flexibility...",
        "target_time": "2024-01-15T07:00:00.000Z",
        "repeats": [0, 1, 2, 3, 4],
        "icon_id": 1,
        "difficulty": "beginner",
        "category": "fitness",
        "estimated_duration": 15,
        "success_tips": ["Start with 5 minutes", "Do it right after waking up"]
      }
    ],
    "userProfile": {
      "age": 25,
      "fitnessLevel": "beginner",
      "primaryGoal": "weight-loss",
      "motivationLevel": "high"
    },
    "existingHabitsCount": 2,
    "options": {
      "maxSuggestions": 5,
      "focusArea": "general"
    }
  }
}
```

#### GET /api/v1/suggestions/analysis
Get comprehensive analysis of user's habit patterns and insights.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "strengths": ["You have good morning routines"],
      "gaps": ["Consider adding evening activities"],
      "recommendations": ["Focus on consistency"],
      "consistency_score": 75,
      "balance_score": 60
    },
    "metrics": {
      "totalHabits": 3,
      "activeHabits": 2,
      "averageFrequency": 4.5,
      "consistencyScore": 75,
      "balanceScore": 60
    }
  }
}
```

#### GET /api/v1/suggestions/category/:category
Get suggestions for a specific category (fitness, nutrition, mental-health, sleep, lifestyle).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "category": "fitness",
    "suggestions": [...],
    "userProfile": {...}
  }
}
```

#### GET /api/v1/suggestions/goal/:goal
Get personalized suggestions based on specific fitness goals.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "goal": "weight-loss",
    "suggestions": [...],
    "userProfile": {...},
    "goalAlignment": {
      "userGoal": "weight-loss",
      "requestedGoal": "weight-loss",
      "isAligned": true
    }
  }
}
```

#### POST /api/v1/suggestions/create
Create a new habit from an AI suggestion.

**Request Body:**
```json
{
  "name": "Morning Stretching",
  "target_time": "2024-01-15T07:00:00.000Z",
  "icon_id": 1,
  "repeats": [0, 1, 2, 3, 4],
  "description": "Created from AI suggestion"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "habit": {
      "_id": "...",
      "name": "Morning Stretching",
      "target_time": "2024-01-15T07:00:00.000Z",
      "icon_id": 1,
      "repeats": [0, 1, 2, 3, 4],
      "user": "..."
    },
    "description": "Created from AI suggestion"
  }
}
```

#### GET /api/v1/habits
Gets all habits for the authenticated user.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "name": "Morning Exercise",
      "created_time": "2024-01-15T10:30:00.000Z",
      "target_time": "2024-01-15T07:00:00.000Z",
      "icon_id": 1,
      "repeats": [0, 1, 2, 3, 4],
      "user": "...",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: No valid JWT token provided

#### GET /api/v1/habits/:id
Gets a specific habit by ID.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Morning Exercise",
    "id": 1,
    "created_time": "2024-01-15T10:30:00.000Z",
    "target_time": "2024-01-15T07:00:00.000Z",
    "icon_id": 1,
    "repeats": [0, 1, 2, 3, 4],
    "user": "...",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: No valid JWT token provided
- `404 Not Found`: Habit not found
- `401 Unauthorized`: User not authorized to access this habit

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

3. Run the server:
```bash
npm run dev
```

## Testing

Run tests with:
```bash
npm test
```
