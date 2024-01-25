# via https://github.com/tpAtalas/tp-next-todos/wiki/Deploy-Next.js-App-into-Google-Cloud-Run(GCR)-with-Docker

FROM --platform=linux/amd64 node:18.18.0-alpine AS deps

WORKDIR /src

ADD package.json /src

RUN yarn install --ignore-engines

ADD .env /src

ADD snapshots/schema.yaml snapshots/
# ADD .env-development /src

# CMD ["yarn", "dev"]
CMD ["yarn", "build"]