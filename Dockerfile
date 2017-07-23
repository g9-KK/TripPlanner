FROM node:boron-alpine
ARG http_proxy


# Create app directory
RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app

ADD package.json /usr/src/app
RUN npm config set proxy $http_proxy && \
    npm config set https-proxy $http_proxy && \
    npm config set progress false && \
    npm install npm@latest -g && \
    cd /usr/src/app && npm install --no-optional

COPY . /usr/src/app
RUN npm run build

EXPOSE 8111
CMD npm start
