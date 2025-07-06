# Stage 1: Build React app
FROM node:18-alpine as client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Backend
FROM node:18-alpine
WORKDIR /app

# Backend dependencies
COPY package*.json ./
RUN npm install

# Copy backend source
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

# Copy React build output to the expected location
COPY --from=client-build /app/client/build ./client/build

EXPOSE 3000
CMD ["npm", "start"] 