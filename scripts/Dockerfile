FROM teddysun/xray

RUN apk add --no-cache curl

COPY config.json /etc/xray/config.json

CMD ["xray", "run", "-c", "/etc/xray/config.json"]
