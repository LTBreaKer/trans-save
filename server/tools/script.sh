#!/bin/sh

# chown -R www-data:www-data /var/www/pong.com

sed -i 's#user www-data;#user root root;#g' /etc/nginx/nginx.conf

# openssl req -x509 -nodes -days 365 \
# 	-newkey rsa:2048 \
# 	-keyout /etc/ssl/private/key.key \
# 	-out /etc/ssl/certs/cert.crt \
# 	-subj "/C=FR/ST=Île-de-France/L=Paris/O=LTB/CN=aharrass.42.fr"

chmod 664 /etc/ssl/private/cert-key.pem
chmod 600 /etc/ssl/certs/cert.pem
chown root:root /etc/ssl/certs/cert.pem \
    			/etc/ssl/private/cert-key.pem

nginx -g 'daemon off;'