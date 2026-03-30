# Refyn

A full-stack web application for collaborative code reviews. Refine your code, together. Teams can create reviews comparing original and changed code, visualize diffs, add line-specific comments, and approve or reject changes. Includes GitHub integration, automated code analysis, and background job processing.

## Features

### Core
- **Authentication** - Register and login with JWT-based token auth
- **Code Reviews** - Create, assign, and manage reviews with status tracking (open, approved, rejected)
- **Diff Visualization** - Side-by-side color-coded diff comparison
- **Line Comments** - Add comments to specific lines of code

### Advanced
- **GitHub Integration** - Connect repos, import pull requests as reviews
- **Code Analysis** - Automated analyzers for complexity, security vulnerabilities, and refactoring patterns
- **Background Jobs** - Async job queue with retry logic and real-time status polling
- **PR-Style UI** - GitHub PR-style review interface with metadata and labels
- **Advanced Dashboard** - Statistics, status distribution, and quality metrics
- **Security** - Rate limiting, input validation, and security headers

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, React Router, Axios, React Diff Viewer |
| **Backend** | Node.js, Express, Mongoose, JWT, bcryptjs |
| **Database** | MongoDB 7.0+ |
| **Infrastructure** | Docker, Docker Compose |

## Getting Started

### Prerequisites

- Node.js 14+
- MongoDB (local, Docker, or [Atlas](https://www.mongodb.com/atlas))
- Git

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd code-review-project

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

Copy the environment template and update the values:

```bash
cp .env.example backend/.env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | - |
| `JWT_SECRET` | Secret for signing tokens (change in production) | - |
| `GITHUB_API_BASE_URL` | GitHub API URL | `https://api.github.com` |
| `LOG_LEVEL` | Logging level (info, warn, error, debug) | `info` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | `60000` |
| `JOB_QUEUE_MAX_RETRIES` | Max retry attempts for jobs | `3` |

### Running the Application

**With Docker (recommended):**

```bash
docker-compose up
```

**Without Docker:**

```bash
# Start the backend (from /backend)
npm run dev

# Start the frontend (from /frontend)
npm start
```

The frontend runs at `http://localhost:3000` and the backend at `http://localhost:5000`.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Create a review |
| GET | `/api/reviews` | List user's reviews |
| GET | `/api/reviews/:id` | Get review details |
| POST | `/api/reviews/:id/comments` | Add a comment |
| PUT | `/api/reviews/:id/status` | Update status |

### GitHub Integration
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/github/connect` | Connect a repository |
| POST | `/api/github/import-pr` | Import a PR as a review |
| GET | `/api/github/integrations` | List connected repos |
| DELETE | `/api/github/disconnect/:id` | Disconnect a repo |

### Code Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analysis/:reviewId/analyze` | Run all analyzers |
| POST | `/api/analysis/:reviewId/analyze/:type` | Run specific analyzer |
| GET | `/api/analysis/:reviewId/results` | Get analysis results |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/:jobId` | Get job status |
| GET | `/api/jobs/:jobId/poll` | Long-poll for completion |
| POST | `/api/jobs/:jobId/cancel` | Cancel a job |

Full API documentation is available in [docs/API.md](docs/API.md).

## Project Structure

```
code-review-project/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route handlers
│   ├── middleware/       # Auth, validation, security
│   ├── services/        # JobQueue, GitHubService
│   │   └── analyzers/   # Complexity, Security, Refactoring
│   ├── utils/           # Logger
│   └── server.js        # Entry point
├── frontend/
│   └── src/
│       ├── components/  # React components
│       └── App.js       # Router setup
├── tests/               # Integration & unit tests
├── docs/                # Documentation
└── docker-compose.yml
```

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Documentation

- [API Reference](docs/API.md)
- [Architecture & Structure](docs/STRUCTURE.md)
- [Code Analyzers](docs/ANALYZERS.md)
- [Enterprise Features](docs/ENTERPRISE_FEATURES.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing](docs/CONTRIBUTING.md)

## License

This project is for educational and portfolio purposes.
