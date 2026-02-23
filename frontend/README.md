# EduFlow - Online Learning Marketplace

EduFlow is a production-ready online learning marketplace platform where users can discover, enroll in, and learn from a variety of courses.

## Project Structure

This is a monorepo containing:
- `backend`: Express + MongoDB API deployed on Render.
- `frontend`: Vite + React + Tailwind CSS application deployed on Vercel.

## Technologies Used

- **Frontend**: Vite, React, TypeScript, shadcn-ui, Tailwind CSS.
- **Backend**: Node.js, Express, MongoDB (Mongoose), TypeScript.

## Getting Started

### Prerequisites

- Node.js & npm installed.

### Local Development

1. Clone the repository.
2. Install dependencies for both frontend and backend.
3. Set up environment variables based on `.env.example` files.
4. Run `npm run dev` in both directories.

## Deployment

- **Backend**: Deployed on Render with explicit `0.0.0.0` port binding and health checks.
- **Frontend**: Deployed on Vercel as a Single Page Application (SPA).
