FROM node:20-bullseye

RUN npm install -g truffle

RUN mkdir truffle

WORKDIR /truffle

RUN truffle init

RUN rm truffle-config.js

COPY ./conf/truffle-config.js ./truffle-config.js

COPY ./tools/TournamentContract.sol ./contracts/TournamentContract.sol

COPY ./tools/2_deploy_contracts.js ./migrations