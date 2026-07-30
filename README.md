# Zanwik — B2B Software Reviews & Recommendations

A comprehensive software discovery platform helping businesses find the right tools through unbiased reviews, expert advice, and personalized recommendations.

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB with Mongoose
- **Auth:** JWT-based authentication

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Copy environment files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Edit .env files with your configuration
```

### Database

```bash
cd backend
npm run seed   # Seed the database with sample data
```

### Development

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
zanwik.com/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # Pages (App Router)
│   │   ├── components/ # Reusable components
│   │   ├── lib/       # API client & mock data
│   │   └── types/     # TypeScript types
│   └── ...
├── backend/           # Express API
│   ├── src/
│   │   ├── models/    # Mongoose schemas
│   │   ├── routes/    # API route handlers
│   │   ├── middleware/ # Auth middleware
│   │   └── config/    # Database config
│   └── ...
├── blog/              # Blog content
├── docs/              # Documentation
└── vendor/            # Vendor resources
```

## Features

- Browse 100,000+ software products across categories
- Read and write user reviews with ratings
- Personalized software recommendations
- Vendor lead generation program
- Resource center with guides and reports
- Responsive design for all devices
