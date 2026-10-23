FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --chown=node:node server.js sw.js manifest.webmanifest ./
COPY --chown=node:node index.html explore.html audit.html login.html cms.html ./
COPY --chown=node:node style.css dapper.css explore.css audit.css cms.css ./
COPY --chown=node:node script.js explore.js audit.js login.js cms.js ./
COPY --chown=node:node lib ./lib
COPY --chown=node:node data ./data
COPY --chown=node:node assets ./assets

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
