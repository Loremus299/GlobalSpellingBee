FROM node:25 AS builder

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:25 AS runner
WORKDIR /app
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
RUN npm install --only=production

EXPOSE 3000
CMD ["npm", "start"]
