FROM node:20-slim

# 下面這行是剛才提到的，強迫走 IPv4，避免 IPv6 繞路繞到超時
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "main.js"]
