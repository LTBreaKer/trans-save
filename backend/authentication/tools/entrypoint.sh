#!/bin/bash

echo db:5432:$POSTGRES_DB:$POSTGRES_USER:$POSTGRES_PASSWORD > ~/.pgpass
chmod 0600 ~/.pgpass

until PGPASSFILE=~/.pgpass psql -h db -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1" >/dev/null 2>&1; do
        echo "Waiting for PostgreSQL to start..."
        sleep 1
done

# openssl req -x509 -nodes -days 365 \
# 	-newkey rsa:2048 \
# 	-keyout /etc/ssl/private/key.key \
# 	-out /etc/ssl/certs/cert.crt \
# 	-subj "/C=FR/ST=Île-de-France/L=Paris/O=LTB/CN=aharrass.42.fr"

chmod 664 /etc/ssl/private/cert-key.pem
chmod 600 /etc/ssl/certs/cert.pem
chown root:root /etc/ssl/certs/cert.pem \
    			/etc/ssl/private/cert-key.pem
# sleep infinity

python /authentication/manage.py makemigrations
python /authentication/manage.py migrate

# echo "from authentication.models import CustomUser; from django.contrib.auth import get_user_model; UserModel = get_user_model(); CustomUser.objects.create_superuser(username='admin', password='firstuser')" | python manage.py shell
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser(username='admin', password='firstuser')" | python manage.py shell
exec "$@"