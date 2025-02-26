FROM node:22-alpine

# Set the environment variables
ARG GIT_TAG=unknown_version
ENV GIT_TAG ${GIT_TAG}
ENV ADMIN_UI_BASE=/flosim/
ENV ADMIN_UI_ROUTE_BASE=/flosim/
ENV TZ UTC

# Set the working directory
WORKDIR /usr/src/app

# Copy the package files to the working directory
COPY package*.json /usr/src/app/

# Copy all files from the project’s root to the working directory
COPY . /usr/src/app

# Install node modules
RUN npm install --quiet

# Build the project
RUN npm run build
RUN echo $ADMIN_UI_ROUTE_BASE > /usr/src/app/route_base.txt

# Add flolive group/user & transfer ownership
RUN addgroup -S flolive && adduser -D flolive -S flolive -G flolive && chown -R flolive /usr/src/app

# Set flolive user
USER flolive:flolive

# Expose the project
EXPOSE 4000
CMD [ "npm", "run", "dstart" ]