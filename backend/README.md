# AI Travel Assistant - Backend API

Node.js + Express + TypeScript + MongoDB backend for AI Travel Assistant.

## Tech Stack

- Node.js 18+
- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Winston Logger
- OpenAI API

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Express middleware
├── models/         # Mongoose models
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript types
├── utils/          # Utility functions
└── server.ts       # Entry point
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Start MongoDB

4. Run development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Environment Variables

See `.env.example` for all required environment variables.

## API Documentation

API endpoints are documented in the main project README.
