FROM node:lts-alpine
RUN apk add --update git

ENV USER=whiteboard
ENV UID=12345
ENV GID=23456

RUN adduser \
    --disabled-password \
    "$USER"

USER whiteboard
RUN mkdir -p /home/whiteboard/whiteboard-server
RUN mkdir -p /home/whiteboard/scene/contracts
COPY --chown=whiteboard lib/scene/contracts /home/whiteboard/scene/contracts
WORKDIR /home/whiteboard/whiteboard-server
COPY --chown=whiteboard package.json .
COPY --chown=whiteboard scripts scripts
COPY --chown=whiteboard .env.example .
RUN ls -la
RUN npm install -y
COPY --chown=whiteboard . .

ENV NODE_ENV production
CMD npm run start
