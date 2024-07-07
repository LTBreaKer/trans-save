FROM postgres:15.6

ARG AUTH_DB

ARG USER_MANAGEMENT_DB

RUN echo "CREATE DATABASE $AUTH_DB;\nCREATE DATABASE $USER_MANAGEMENT_DB;" >> /docker-entrypoint-initdb.d/init.sql

RUN chmod 755 /docker-entrypoint-initdb.d/init.sql

RUN chown postgres:postgres /docker-entrypoint-initdb.d/init.sql

