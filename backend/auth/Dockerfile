FROM python:3.11.9-bullseye

RUN apt-get update && apt-get upgrade -y

RUN apt-get install postgresql -y

# Install dependencies

COPY ./requirements.txt ./requirements.txt

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY ./tools/entrypoint.sh /entrypoint.sh

#COPY ./tools/cert-key.pem /etc/ssl/private/cert-key.pem
#COPY ./tools/cert.pem /etc/ssl/certs/cert.pem

COPY ./tools/server.key /etc/ssl/private/server.key
COPY ./tools/server.crt /etc/ssl/certs/server.crt

RUN chmod +x /entrypoint.sh

RUN mkdir authentication

WORKDIR /authentication
