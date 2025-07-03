# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only backend files
COPY package*.json ./
COPY . .

# Install backend dependencies
RUN npm install

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 