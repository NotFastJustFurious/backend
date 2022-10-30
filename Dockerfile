#FROM alpine:3.15
#RUN apk add --no-cache nodejs yarn
FROM node

ADD . /srv/server/
WORKDIR /srv/server
RUN yarn install

ENTRYPOINT ["yarn"]
CMD ["start"]
