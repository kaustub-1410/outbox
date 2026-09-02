FROM node:20-alpine AS base

WORKDIR /app

# Copy root workspace package manifests
COPY package.json ./
COPY packages/shared-types ./packages/shared-types
COPY apps/backend ./apps/backend

# Install dependencies and build shared-types
RUN npm install
RUN npm run build --workspace=packages/shared-types

# Build backend
WORKDIR /app/apps/backend
RUN npx prisma generate
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
