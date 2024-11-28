FROM node:18

WORKDIR /app

COPY package*.json ./

# Install
RUN npm install

COPY . .

# npm run build Or npm run dev?
RUN npm run build

CMD ["npm", "start"] # ?
