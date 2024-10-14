# Use Node.js LTS version
FROM node:lts

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE 5000

# Start the app
CMD [ "npm", "start" ]
