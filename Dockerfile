FROM node:20

WORKDIR /app

# Copy backend files
COPY backend/ ./

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy startup script
COPY backend/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port
EXPOSE 3000

# Start the app with migration
CMD ["/app/start.sh"]
