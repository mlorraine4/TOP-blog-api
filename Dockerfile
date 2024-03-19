FROM node:18-alpine
RUN mkdir /app
WORKDIR /app
COPY . .
RUN npm install --production
# ENTRYPOINT "node"
CMD ["npm", "start"]
EXPOSE 3000