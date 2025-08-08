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
  "id": 1,
  "created_time": "2024-01-15T10:30:00.000Z",
  "target_time": "2024-01-15T07:00:00.000Z",
  "icon_id": 1,
  "repeats": [0, 1, 2, 3, 4]
}
```

**Field Descriptions:**
- `name` (string, required): The name of the habit
- `id` (number, required): Unique identifier for the habit
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
- `400 Bad Request`: Missing required fields or invalid data
- `400 Bad Request`: Habit with same ID already exists for user

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
      "id": 1,
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
