FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_BACKEND_URL=https://api.tsunderechan.ru
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build/client /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
