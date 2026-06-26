FROM node:20-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Generate Prisma client (schema is in backend/prisma)
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copy rest of backend
COPY backend/ ./

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
