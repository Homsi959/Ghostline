≠FROM teddysun/xray

RUN apk add --no-cache curl

COPY xray-client.config.dev.json /etc/xray/xray-client.config.dev.json

CMD ["xray", "run", "-c", "/etc/xray/xray-client.config.dev.json"]
