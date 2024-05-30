FROM python:3.11.9-bullseye

RUN apt-get update && apt-get upgrade -y

RUN apt-get install postgresql -y

# Install dependencies

COPY ./requirements.txt requirements.txt

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY ./entrypoint.sh /entrypoint.sh

COPY ./backend/cert-key.pem /etc/ssl/private/cert-key.pem
COPY ./backend/cert.pem /etc/ssl/certs/cert.pem

RUN chmod +x /entrypoint.sh

RUN mkdir backend

WORKDIR /backend
