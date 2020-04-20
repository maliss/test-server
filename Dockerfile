FROM node:12-alpine AS build
WORKDIR /test-ubisoft-server

COPY package.json ./
COPY package-lock.json ./
RUN ["npm", "install"]

COPY ./src ./src
COPY tsconfig.json ./
RUN ["npm", "run", "build"]

FROM node:12-alpine
WORKDIR /test-ubisoft-server

COPY --from=build /test-ubisoft-server/dist ./
COPY --from=build /test-ubisoft-server/package.json ./
RUN ["npm", "install", "--production"]
CMD ["node", "server/server.js"]