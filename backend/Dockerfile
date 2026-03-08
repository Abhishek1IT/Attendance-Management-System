FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY index.js ./
COPY src ./src
COPY scripts ./scripts

EXPOSE 5000

CMD ["npm", "start"]