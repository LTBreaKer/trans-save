#!/bin/bash

# echo db:5432:$GAME_DB:$POSTGRES_USER:$POSTGRES_PASSWORD > ~/.pgpass

# chmod 0600 ~/.pgpass

# until PGPASSFILE=~/.pgpass psql -h db -U $POSTGRES_USER -d $GAME_DB -c "SELECT 1" >/dev/null 2>&1; do
#         echo "Waiting for PostgreSQL to start..."
#         sleep 1
# done


# chmod 664 /etc/ssl/private/cert-key.pem
# chmod 600 /etc/ssl/certs/cert.pem
# chown root:root /etc/ssl/certs/cert.pem \
#     			/etc/ssl/private/cert-key.pem
# sleep infinity

python /app/pong_game/pong_game/manage.py makemigrations
python /app/pong_game/pong_game/manage.py migrate

exec "$@"