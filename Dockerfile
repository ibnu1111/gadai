FROM node:20-alpine

WORKDIR /app

# Copy entire backend first
COPY backend/ ./

# Install dependencies (without postinstall prisma generate yet)
RUN npm install --ignore-scripts

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
