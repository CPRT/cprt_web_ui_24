FROM nginx:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Create mount point for the mapping tiles
RUN mkdir -p /usr/src/app/mapping_tiles

# Create a directory for the cache
RUN mkdir -p /var/cache/nginx && chown -R nginx:nginx /var/cache/nginx

# Expose port 80
EXPOSE 80 

# Set the working directory in the container to mapping_tiles
# When the command is run it will serve files from working directory
WORKDIR /usr/src/app/mapping_tiles

COPY mapping_tiles/ /usr/src/app/mapping_tiles

# Run the app when the container launches
CMD ["nginx", "-g", "daemon off;"]
