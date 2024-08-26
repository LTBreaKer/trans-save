FROM postgres:15.6

ARG AUTH_DB

ARG USER_MANAGEMENT_DB

ARG GAME_DB

ARG TAG_GAME_DB

ARG TOURNAMENT_DB

RUN echo "CREATE DATABASE $AUTH_DB;\nCREATE DATABASE $USER_MANAGEMENT_DB;\nCREATE DATABASE $GAME_DB;\nCREATE DATABASE $TAG_GAME_DB;\nCREATE DATABASE $TOURNAMENT_DB;" >> /docker-entrypoint-initdb.d/init.sql

RUN chmod 755 /docker-entrypoint-initdb.d/init.sql

RUN chown postgres:postgres /docker-entrypoint-initdb.d/init.sql

