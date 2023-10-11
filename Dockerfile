## base
FROM node:lts as base
ENV APP_ID=${APP_ID} 
ENV APP_SECRET=${APP_SECRET} 
ENV SPACE_ID=${SPACE_ID} 
ENV FIGMA_API_KEY=${FIGMA_API_KEY} 
ENV FEISHU_HOST="https://open.feishu.cn"
ENV ENVIRONMENT=${ENVIRONMENT}
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false
WORKDIR /home/node/app
COPY . /home/node/app

## development
FROM base as development
WORKDIR /home/node/app
RUN yarn
EXPOSE 3000
CMD ["yarn", "start", "-h", "0.0.0.0"]

## production
FROM base as production
WORKDIR /home/node/app
COPY --from=development --chown=node:node /home/node/app/node_modules /home/node/app/node_modules
RUN yarn build

## deploy
FROM nginx:stable-alpine as deploy
ENV INSTALL_PATH /usr/share/nginx/html
WORKDIR $INSTALL_PATH
COPY ./default.conf /etc/nginx/conf.d
COPY --from=production /home/node/app/build /usr/share/nginx/html
RUN set -x ; \
  addgroup -g 82 -S www-data ; \
  adduser -u 82 -D -S -G www-data www-data && exit 0 ; exit 1
RUN chown -R www-data:www-data $INSTALL_PATH/*
RUN chmod -R 0755 $INSTALL_PATH/*