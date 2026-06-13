FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run prisma:generate
RUN npm run build

ENV NODE_ENV=production

EXPOSE 4000

CMD ["npm", "run", "start"]
