FROM node:18-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

FROM base AS dependencies
RUN npm ci --only=production

FROM base AS build
RUN npm ci
COPY . .

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/server.js ./
COPY --from=build /app/package.json ./
EXPOSE 5000
CMD ["node", "server.js"]
