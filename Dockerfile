FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build frontend and server
RUN cd frontend && npm install && npm run build:production

# Ensure server.js is copied to dist/server
RUN mkdir -p /app/frontend/dist/server && cp /app/frontend/src/server/server.js /app/frontend/dist/server/

# Debug built files
RUN echo "Listing frontend/dist directory:" && ls -la /app/frontend/dist
RUN echo "Listing frontend/dist/server directory:" && ls -la /app/frontend/dist/server
RUN echo "Checking for index.html:" && test -f /app/frontend/dist/index.html && echo "index.html exists" || echo "index.html missing!"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "run", "start:prod"]
