FROM node:18-alpine

WORKDIR /app

# Copy root package.json
COPY package.json ./

# Copy all files and directories (respects .dockerignore)
COPY . .

# Install dependencies in backend
WORKDIR /app/backend
RUN npm install

# Set working directory back to app root
WORKDIR /app

# Expose port
EXPOSE 3000

CMD npm start

# Start command (using shell form so 'cd' works in npm scripts)
CMD npm start
