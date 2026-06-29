FROM node:20

WORKDIR /app

# Copy backend files
COPY backend/ ./

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Run database migrations
RUN npx prisma db push

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
