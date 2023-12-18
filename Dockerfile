# ---- Build Stage ----
FROM node:18 AS build-stage

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# ---- Runtime Stage ----
FROM node:18-slim AS runtime-stage
ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps
ENV PORT=3000
ENV GOTRUE_JWT_EXP=3600
ENV DB_NAMESPACE=auth
ENV GOTRUE_DISABLE_SIGNUP=false
ENV GOTRUE_MAILER_AUTOCONFIRM=true
ENV GOTRUE_SMS_AUTOCONFIRM=false
ENV GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated
ENV GOTRUE_SITE_URL=http://localhost:3000
ENV DB_URI=/app/app.db
# ENV DEBUG="subzero:*"
# ENV GOTRUE_LOG_LEVEL=DEBUG


# Set working directory
WORKDIR /app

# Copy built app from the build stage
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/package*.json ./


# Install production dependencies
RUN npm ci

# Expose port (e.g., 3000) if your app needs it
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/server.cjs"]
