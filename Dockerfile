FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY backend/ ./

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
