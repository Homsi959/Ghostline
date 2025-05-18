FROM node:22-slim

RUN apt-get update && \
    apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release && \
    # Doppler CLI
    curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | \
        gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" > \
        /etc/apt/sources.list.d/doppler-cli.list && \
    apt-get update && \
    apt-get install -y doppler docker.io && \
    apt-get clean

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production

COPY assets ./assets
COPY dist ./dist

CMD ["doppler", "run", "--", "node", "dist/main.js"]
