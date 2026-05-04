FROM node:20-slim

# 強制 Node.js 環境變數：優先 IPv4 + 增加連線執行緒
ENV NODE_OPTIONS="--dns-result-order=ipv4first"
ENV UV_THREADPOOL_SIZE=64

WORKDIR /app

# 確保抓到最新版，舊版真的會有 10秒 超時 Bug
RUN npm install discord.js@14.14.1 google-translate-api-x@latest

COPY . .

CMD ["node", "main.js"]
