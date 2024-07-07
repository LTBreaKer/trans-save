FROM debian:bullseye

RUN apt-get update && apt-get upgrade -y && apt-get install nginx openssl certbot python3-certbot-nginx -y

COPY ./default.conf /etc/nginx/sites-available/example.com

COPY ./conf/* /etc/nginx/conf.d

RUN rm /etc/nginx/sites-enabled/default

RUN ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/

COPY ./tools/cert.pem /etc/ssl/certs/cert.pem
COPY ./tools/cert-key.pem /etc/ssl/private/cert-key.pem

# RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/example.com.key -out /etc/ssl/certs/example.com.crt -subj "/C=FR/ST=Paris/L=Paris/O=42/OU=42/CN=example.com"

# RUN chmod 664 /etc/ssl/private/example.com.key

# RUN chmod 600 /etc/ssl/certs/example.com.crt

# RUN chown root:root /etc/ssl/private/example.com.key /etc/ssl/certs/example.com.crt
# RUN groupadd -g 1001 2019

# RUN useradd -u 1001 -g 2019 -s /bin/bash -m aharrass

# RUN mkdir -p /var/www/pong.com

# COPY ./front/* /var/www/pong.com

# RUN chown -R www-data:www-data /var/www/pong.com
COPY ./tools/script.sh .

RUN chmod +x script.sh

ENTRYPOINT [ "./script.sh" ]

# ENTRYPOINT [ "nginx", "-g", "daemon off;" ]