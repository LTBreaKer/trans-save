FROM python:3.11.4-alpine

WORKDIR /usr/src/app/

ENV PYTHONBUFFERED 1

RUN pip install --upgrade pip 

RUN apk update \
    && apk add --no-cache gcc musl-dev libffi-dev

COPY ./tools/requ.txt requirements.txt

RUN pip install -r requirements.txt

COPY ./tools/script.sh .

RUN chmod +x script.sh

COPY ./project/ /usr/src/app/

# CMD [ "python", "manage.py", "migrate"]

COPY ./tools/server.key /etc/ssl/private/server.key
COPY ./tools/server.crt /etc/ssl/certs/server.crt

WORKDIR /usr/src/app/vv

ENTRYPOINT [ "ash", "../script.sh" ]

# ENTRYPOINT ["sleep", "infinty"]