FROM node:20-alpine

RUN apk add --update --no-cache \
        make \
        g++ \
        jpeg-dev \
        cairo-dev \
        giflib-dev \
        pango-dev
RUN apk add --update  --repository http://dl-3.alpinelinux.org/alpine/edge/testing libmount ttf-dejavu ttf-droid ttf-freefont ttf-liberation fontconfig

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "start"]