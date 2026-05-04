FROM node:20-slim

# 強制 Node.js 環境變數：優先 IPv4 + 增加連線執行緒
ENV NODE_OPTIONS="--dns-result-order=ipv4first"
ENV UV_THREADPOOL_SIZE=64

WORKDIR /app

# 修正：加上 undici，確保 main.js 頂端的全域設定不會噴「找不到模組」
RUN npm install discord.js@14.14.1 google-translate-api-x@latest undici

COPY . .

CMD ["node", "main.js"]
