# API Documentation

## Authentication

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "User registered"
}
```

### POST /api/auth/login
Login a user.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt_token"
}
```

## Reviews

### POST /api/reviews
Create a new review. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "originalCode": "string",
  "changedCode": "string",
  "reviewers": "comma_separated_user_ids"
}
```

**Response:**
Review object

### GET /api/reviews
Get all reviews for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
Array of review objects

### GET /api/reviews/:id
Get a specific review.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
Review object with populated comments

### POST /api/reviews/:id/comments
Add a comment to a review.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "text": "string",
  "line": number
}
```

**Response:**
Updated review object

### PUT /api/reviews/:id/status
Update review status.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "approved" | "rejected"
}
```

**Response:**
Updated review object