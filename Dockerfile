FROM node:10-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package.json ./
COPY yarn.lock ./
RUN npm install yarn -g

RUN yarn install

COPY --chown=node:node dist/ .
USER node
EXPOSE 8080

CMD [ "node", "index.js" ]