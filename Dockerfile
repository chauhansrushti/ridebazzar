FROM node:18-alpine

WORKDIR /app

# Copy root package.json
COPY package.json ./

# Copy all HTML files and static assets from root
COPY *.html ./
COPY css/ ./css/
COPY js/ ./js/
COPY images/ ./images/
COPY aboutus/ ./aboutus/
COPY carfinance/ ./carfinance/
COPY hub/ ./hub/

# Copy backend
COPY backend ./backend

# Install dependencies in backend
WORKDIR /app/backend
RUN npm install

# Set working directory back to app root
WORKDIR /app

# Expose port
EXPOSE 3000

# Start command (using shell form so 'cd' works in npm scripts)
CMD npm start
