FROM node:20

# 增加這一行，強迫 Node.js 優先使用 IPv4
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "main.js"]
