FROM node:20

WORKDIR /app

COPY ./vendor/  ./vendor/

COPY package.json package-lock.json ./
RUN npm ci

COPY fonts.css  ./

COPY ./src/     ./src/
COPY ./build/   ./build/

ENV NOTES_DIR=./notes/

ENTRYPOINT ["npm", "run", "build"]
