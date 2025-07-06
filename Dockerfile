# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy backend source files
COPY src ./src
COPY public ./public
COPY railway.json ./

# Copy pre-built React app
COPY client/build ./client/build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 