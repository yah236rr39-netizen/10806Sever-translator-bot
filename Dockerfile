FROM node:20

# 增加環境變數強迫 IPv4 優先，避免 IPv6 導致的 Timeout
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

WORKDIR /app

# 直接在這裡強制安裝最新穩定版
RUN npm install discord.js@latest google-translate-api-x@latest

COPY . .

CMD ["node", "main.js"]
