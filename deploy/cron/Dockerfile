FROM alpine:3.22
RUN apk add --no-cache curl tzdata
COPY call-app.sh /usr/local/bin/call-app
COPY crontab /etc/crontabs/root
RUN chmod 0755 /usr/local/bin/call-app && chmod 0600 /etc/crontabs/root
CMD ["crond", "-f", "-l", "6"]
