# Use official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the backend code
COPY . .

# Expose server port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
