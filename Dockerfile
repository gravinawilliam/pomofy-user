FROM node:18.15.0-slim

USER node

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY --chown=node package*.json ./

RUN npm install

COPY --chown=node ./ .

RUN npm run build
RUN npm run prisma:generate
# RUN npm run prisma:migrate

EXPOSE 2222

CMD ["npm", "run", "start:prod"]
