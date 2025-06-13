FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build frontend
RUN cd frontend && npm install && npm run build:production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "run", "start:prod"]
