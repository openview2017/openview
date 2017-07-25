FROM node

COPY . /app
WORKDIR /app

RUN npm install &&\
    cd ./public &&\
    npm install &&\
    openview_REQUEST_TIME_WINDOW=2 npm run build &&\
    cd ..

WORKDIR /app

EXPOSE 5000

CMD ["node", "index.js"]
