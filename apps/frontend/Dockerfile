FROM node:20-alpine AS base

WORKDIR /app

# Copy workspace package manifests
COPY package.json ./
COPY packages/shared-types ./packages/shared-types
COPY apps/frontend ./apps/frontend

# Install dependencies and build shared-types
RUN npm install
RUN npm run build --workspace=packages/shared-types

# Build frontend
WORKDIR /app/apps/frontend
ENV NEXT_PUBLIC_API_URL=http://localhost:5000/api
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
