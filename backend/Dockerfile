# Multi-stage build kept simple deliberately: this is a POC, not a hardened
# production image (no non-root user pinning, no distroless base) — see
# docs/DELIVERABLES_COVERAGE.md for what a real production image would add.
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src
COPY public ./public

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/server.js"]
