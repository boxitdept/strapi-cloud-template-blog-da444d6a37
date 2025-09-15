FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=development
ENV STRAPI_DISABLE_TELEMETRY=true
EXPOSE 1337
# Actual install happens at runtime so node_modules lives in the volume, not in the image
CMD ["sh","-c","npm run develop"]
