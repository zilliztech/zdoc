FROM nginx:stable-alpine as deploy
ENV INSTALL_PATH /usr/share/nginx/html
WORKDIR $INSTALL_PATH
COPY ./default.conf /etc/nginx/conf.d
COPY ./build /usr/share/nginx/html
RUN set -x ; \
  addgroup -g 82 -S www-data ; \
  adduser -u 82 -D -S -G www-data www-data && exit 0 ; exit 1
RUN chown -R www-data:www-data $INSTALL_PATH/*
RUN chmod -R 0755 $INSTALL_PATH/*