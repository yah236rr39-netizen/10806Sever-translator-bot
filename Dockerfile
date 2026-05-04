FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 這一行很重要，確保它執行的是 node 而不是 streamlit
CMD ["node", "main.js"]
