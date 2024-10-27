#!/bin/bash

rm MyCA.srl server.crt server.csr

openssl req -new -key server.key -out server.csr -config csr.conf

openssl x509 -req -in server.csr -CA myCA.crt -CAkey myCA.key -CAcreateserial -out server.crt -days 365 -sha256

destination=(
    "../backend/auth/tools"
    "../backend/game_db/tools"
    "../backend/Tag/tools"
    "../backend/tag_game_db/tools"
    "../backend/tag-remote/tools"
    "../backend/tournament/tools"
    "../backend/user_management/tools"
)

for dest in "${destination[@]}"; do
    cp "./server.crt" "$dest"
done