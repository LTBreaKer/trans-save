#!bash/ash

echo "OK"
python manage.py makemigrations
python manage.py migrate

exec "$@"