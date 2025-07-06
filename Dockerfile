# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy client package files and install dependencies
COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm install

# Copy client source files and build React app
COPY client/ ./
RUN npm run build

# Return to app directory
WORKDIR /app

# Copy backend source files
COPY src ./src
COPY public ./public
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

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 