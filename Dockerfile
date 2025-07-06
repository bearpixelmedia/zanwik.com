# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install backend dependencies
RUN npm install

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