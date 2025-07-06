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
COPY client/src ./src
COPY client/public ./public
COPY client/tsconfig.json ./
COPY client/tailwind.config.js ./
COPY client/.eslintrc.js ./
COPY client/.prettierrc ./
COPY client/.gitignore ./
COPY client/README.md ./
COPY client/vercel.json ./
COPY client/setup-dev.sh ./
COPY client/setup-env.sh ./
COPY client/.lintstagedrc.js ./
COPY client/.huskyrc ./
COPY client/fix-empty-imports.js ./
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