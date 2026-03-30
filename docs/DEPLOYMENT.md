# Deployment Guide

## Backend Deployment

1. Set up a MongoDB instance (local or cloud like MongoDB Atlas).
2. Update the `.env` file with the correct MONGO_URI, JWT_SECRET, and PORT.
3. Install dependencies: `npm install`
4. Start the server: `npm start` or `npm run dev` for development.

## Frontend Deployment

1. Install dependencies: `npm install`
2. Build the app: `npm run build`
3. Serve the build folder using a static server or deploy to a platform like Vercel/Netlify.

## Docker Deployment

1. Ensure Docker and Docker Compose are installed.
2. Run `docker-compose up` to start MongoDB and the application.

## Environment Variables

- MONGO_URI: MongoDB connection string
- JWT_SECRET: Secret key for JWT tokens
- PORT: Port for the backend server (default 5000)