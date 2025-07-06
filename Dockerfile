# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files for both backend and frontend
COPY package*.json ./
COPY client/package*.json ./client/

# Install backend dependencies
RUN npm install

# Install frontend dependencies
WORKDIR /app/client
RUN npm install

# Build the React app
RUN npm run build

# Go back to app root
WORKDIR /app

# Copy backend source code and config
COPY src/ ./src/
COPY public/ ./public/
COPY railway.json ./
COPY env.example ./
COPY env.production.example ./
COPY supabase-setup.sql ./
COPY supabase-setup-simple.sql ./
COPY create-demo-user.js ./
COPY create-test-user.sql ./
COPY setup.sh ./
COPY deploy.sh ./
COPY deploy-railway.sh ./
COPY deploy-railway-simple.sh ./
COPY generate-env.js ./
COPY Dockerfile ./
COPY .dockerignore ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 