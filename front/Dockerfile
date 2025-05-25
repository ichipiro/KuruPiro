FROM node:22.16.0-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
    
RUN npm ci
COPY . .
RUN npm run build


FROM nginx:mainline-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
