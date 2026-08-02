# Use official Node.js LTS image as base
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package definition files
COPY package*.json ./

# Install production and required dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose backend API port
EXPOSE 5000

# Start Express server
CMD ["node", "server.js"]
