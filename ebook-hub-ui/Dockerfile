# Stage 1: Build the Angular application
FROM node:22 AS build
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build artifacts to a temporary location to handle different structure
COPY --from=build /app/dist /tmp/dist

# Move the correct files to Nginx html directory
# Checks if 'browser' folder exists (new Angular), otherwise uses the project folder (old Angular)
RUN if [ -d "/tmp/dist/ebook-hub-ui/browser" ]; then \
        cp -r /tmp/dist/ebook-hub-ui/browser/* /usr/share/nginx/html; \
    else \
        cp -r /tmp/dist/ebook-hub-ui/* /usr/share/nginx/html; \
    fi

# Remove default nginx static assets if we want to be clean, but cp overwrites.
# Fallback for routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    add_header Cross-Origin-Opener-Policy same-origin-allow-popups; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://api:8080/api/; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
