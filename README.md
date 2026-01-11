# TherapyAI - AI-Powered Mental Health Journal Analysis Platform

Host: http://34.40.81.177

## Overview

TherapyAI is a comprehensive web-based platform designed to help users monitor and understand their mental health through intelligent journal analysis. The platform combines digital journaling with AI-powered insights, enabling users to identify patterns, emotional trends, and potential areas of concern in their mental wellbeing journey.

## Problem Statement

Many individuals struggle to recognize patterns in their mental health or lack the resources to regularly consult with mental health professionals. While journaling is a proven therapeutic tool, most people lack the expertise to identify concerning patterns or trends in their own writing. TherapyAI bridges that gap by providing automated, accessible mental health insights based on personal journal entries.

## What This Project Achieves

TherapyAI provides:

1. **Digital Journaling**: A secure, user-friendly interface for creating and managing daily journal entries
2. **AI-Powered Analysis**: Intelligent analysis of journal entries using OpenAI's GPT-4 Turbo to identify:
   - Emotional patterns and trends
   - Stress indicators and recurring themes
   - Potential mental health concerns
   - Protective factors and personal strengths
   - Progress toward personal goals
3. **Goal Tracking**: A goal management system that integrates with journal analysis to track progress on mental wellness objectives
4. **Privacy-First Architecture**: All data is stored securely in Supabase with user-level isolation

## Architecture

TherapyAI follows a modern full-stack architecture:

```
┌─────────────────┐
│   React Frontend │  (Vite + TypeScript + React Router)
│   (Port 5173)   │
└────────┬────────┘
         │
         │ HTTP/REST API
         │ (Bearer Token Auth)
         ▼
┌─────────────────┐
│  FastAPI Backend │  (Python 3.13 + FastAPI)
│   (Port 8000)   │
└────────┬────────┘
         │
         │ Supabase Client
         ▼
┌─────────────────┐
│   Supabase DB    │  (PostgreSQL + Auth)
│  (Feature Store) │
└─────────────────┘
         │
         │ OpenAI API
         ▼
┌─────────────────┐
│   OpenAI GPT-4   │  (AI Analysis)
└─────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 5.4
- **Routing**: React Router DOM 6.30
- **State Management**: TanStack Query (React Query) 5.83
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS 3.4
- **Authentication**: Supabase Auth (client-side)
- **HTTP Client**: Native Fetch API with custom auth wrapper

### Backend
- **Framework**: FastAPI 0.128
- **Language**: Python 3.13+
- **Package Manager**: uv (via pyproject.toml)
- **Authentication**: JWT verification using Supabase JWT secrets
- **Database Client**: Supabase Python SDK 2.27
- **AI Integration**: OpenAI Python SDK 1.3 (GPT-4 Turbo)
- **Configuration**: python-dotenv for environment variables

### Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Google Cloud Platform (GCP) Compute Engine
- **Web Server**: Nginx (reverse proxy)
- **Infrastructure as Code**: Terraform

## Project Structure

```
therapyAI/
├── backend/                    # FastAPI backend application
│   ├── routers/                # API route handlers
│   │   ├── journal.py         # Journal entry CRUD operations
│   │   ├── inference.py       # AI analysis endpoints
│   │   ├── goals.py           # Goal management endpoints
│   │   └── prompts/           # AI prompt templates
│   │       └── mental_health_checkin.yaml
│   ├── schemas.py             # Pydantic models for request/response
│   ├── dependencies.py        # FastAPI dependencies (auth, Supabase client)
│   ├── main.py                # FastAPI application entry point
│   └── pyproject.toml         # Python dependencies
│
├── client/                     # React frontend application
│   ├── src/
│   │   ├── pages/             # Route components
│   │   │   ├── Dashboard.tsx  # Main dashboard
│   │   │   ├── Journal.tsx    # Journal entries list
│   │   │   ├── JournalNew.tsx # Create new entry
│   │   │   ├── JournalEntry.tsx # View/edit entry
│   │   │   ├── Goals.tsx      # Goals list
│   │   │   ├── GoalNew.tsx    # Create new goal
│   │   │   ├── GoalDetail.tsx # View/edit goal
│   │   │   ├── Analysis.tsx   # AI analysis interface
│   │   │   ├── Signin.tsx     # Sign in page
│   │   │   └── Signup.tsx     # Sign up page
│   │   ├── components/        # Reusable UI components
│   │   │   ├── layout/        # Layout components
│   │   │   │   └── AppLayout.tsx # Main app layout with sidebar
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── PrivateRoute.tsx # Route protection
│   │   │   └── ErrorBoundary.tsx # Error handling
│   │   ├── contexts/          # React contexts
│   │   │   └── AuthContext.tsx # Authentication state
│   │   ├── services/          # API service layer
│   │   │   └── api.ts         # API client functions
│   │   ├── lib/               # Utility libraries
│   │   │   ├── supabase.ts    # Supabase client
│   │   │   └── utils.ts       # Helper functions
│   │   ├── types/             # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── App.tsx            # Root component with routing
│   │   └── main.tsx           # Application entry point
│   ├── package.json           # Node.js dependencies
│   └── vite.config.ts         # Vite configuration
│
└── infrastructure/             # Deployment infrastructure
    ├── main.tf                # Terraform configuration
    ├── startup.sh             # VM initialization script
    ├── nginx.conf             # Nginx configuration
    └── therapyai.service      # Systemd service file
```

## How It Works

### Authentication Flow

1. **User Registration/Login**: Users sign up or sign in through the frontend using Supabase Auth
2. **Token Management**: Supabase provides a JWT access token upon successful authentication
3. **API Authentication**: The frontend includes the JWT token in the `Authorization: Bearer <token>` header for all API requests
4. **Backend Verification**: The FastAPI backend verifies the JWT token using Supabase's JWT secret, extracting user information (user ID, email) from the token payload
5. **User Isolation**: All database queries are scoped to the authenticated user's ID, ensuring data privacy

### Journal Entry Management

1. **Create Entry**: User writes a journal entry in the frontend and submits it
2. **API Request**: Frontend sends POST request to `/api/post_journal_entry` with entry content
3. **Database Storage**: Backend inserts the entry into Supabase `journal_entries` table with:
   - `user_id`: Extracted from JWT token
   - `content`: Journal entry text
   - `id`: Auto-generated UUID
   - `created_at` / `updated_at`: Timestamps
4. **Retrieval**: Entries are fetched via `/api/get_journal_entries` with optional date filtering (default: last 30 days)
5. **Update/Delete**: Users can modify or delete their entries through respective API endpoints

### AI Analysis Workflow

1. **User Request**: User selects a time range (1, 7, or 14 days) and triggers analysis
2. **Entry Retrieval**: Backend fetches the last N journal entries for the user
3. **Goal Context**: Backend also retrieves user's active goals (non-completed)
4. **Prompt Construction**: 
   - System prompt defines the AI's role as a supportive mental health assistant
   - User prompt includes:
     - Date range and number of entries
     - Formatted journal entries (chronological order)
     - User's active goals
5. **AI Processing**: OpenAI GPT-4 Turbo analyzes the entries and generates:
   - Emotional snapshot
   - Stressors and patterns
   - Risk flags (if any)
   - Protective factors
   - Goal progress analysis
   - Practical next steps
   - Follow-up questions
   - Safety notes (if needed)
6. **Response Display**: Analysis is displayed in markdown format on the frontend

### Goal Management

1. **Create Goal**: Users create goals with title, description, and status (active/completed/paused)
2. **Storage**: Goals stored in Supabase `goals` table
3. **Integration**: Goals are included in AI analysis to assess progress
4. **Tracking**: Users can update goal status and descriptions as they progress

## Setup Instructions

### Prerequisites

- **Node.js** 18+ and npm/pnpm
- **Python** 3.13+
- **uv** (Python package manager) - Install via: `curl -LsSf https://astral.sh/uv/install.sh | sh`
- **Supabase Account** with a project created
- **OpenAI API Key**

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create a `.env` file**:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_JWT_SECRET=your_supabase_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   ENVIRONMENT=development
   ```

3. **Install dependencies**:
   ```bash
   uv sync
   ```

4. **Run the development server**:
   ```bash
   uv run uvicorn backend.main:app --reload --port 8000
   ```

   Or if running from project root:
   ```bash
   uv run uvicorn main:app --reload --port 8000
   ```

### Frontend Setup

1. **Navigate to client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```
   (or `npm install` if you prefer npm)

3. **Create a `.env` file**:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:8000
   ```

4. **Run the development server**:
   ```bash
   pnpm dev
   ```

   The frontend will be available at `http://localhost:5173`



## API Endpoints

### Journal Endpoints

- `POST /api/post_journal_entry` - Create a new journal entry
- `GET /api/get_journal_entries?since=<ISO_DATE>` - Get journal entries (default: last 30 days)
- `PUT /api/update_journal_entry` - Update an existing journal entry
- `DELETE /api/delete_journal_entry` - Delete a journal entry

### Goals Endpoints

- `POST /api/post_goal` - Create a new goal
- `GET /api/get_goals` - Get all user goals
- `GET /api/get_goal/{goal_id}` - Get a specific goal
- `PUT /api/update_goal` - Update a goal
- `DELETE /api/delete_goal` - Delete a goal

### Inference Endpoints

- `GET /api/inference/mental-health-checkin/1day` - Analyze last 1 entry
- `GET /api/inference/mental-health-checkin/7days` - Analyze last 7 entries
- `GET /api/inference/mental-health-checkin/14days` - Analyze last 14 entries
- `GET /api/inference/check-setup` - Check API configuration (debugging)

All endpoints require authentication via Bearer token in the `Authorization` header.

## Key Features

### 1. Secure Authentication
- Supabase Auth handles user registration and login
- JWT tokens for API authentication
- Row-level security in database ensures user data isolation

### 2. Intelligent Journal Analysis
- AI-powered analysis using GPT-4 Turbo
- Context-aware prompts that consider user goals
- Structured analysis covering emotional patterns, stressors, and recommendations
- Safety detection for concerning content

### 3. Goal Integration
- Goals are factored into AI analysis
- Progress tracking based on journal content
- Status management (active, paused, completed)

### 4. Modern UI/UX
- Responsive design with mobile support
- Dark mode support
- Smooth animations and transitions
- Intuitive navigation with sidebar layout

### 5. Developer Experience
- TypeScript for type safety
- Pydantic models for request/response validation
- Clear separation of concerns
- Comprehensive error handling

## Deployment

The project includes Terraform configuration for deploying to Google Cloud Platform:

1. **Configure Terraform variables** (`infrastructure/variables.tf`)
2. **Initialize Terraform**:
   ```bash
   cd infrastructure
   terraform init
   ```
3. **Plan and apply**:
   ```bash
   terraform plan
   terraform apply
   ```

The startup script (`startup.sh`) installs necessary dependencies on the VM. Additional deployment steps (deploying code, setting up systemd service, configuring Nginx) would need to be done manually or via CI/CD.

## Environment Variables

### Backend (.env)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_JWT_SECRET` - Supabase JWT secret (for token verification)
- `OPENAI_API_KEY` - OpenAI API key
- `ENVIRONMENT` - `development` or `production`

### Frontend (.env)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_API_URL` - Backend API URL (default: `http://localhost:8000`)
