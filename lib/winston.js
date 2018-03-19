const _ = require('lodash');
const winston = require('winston');
const WinstonGrayLog2 = require('winston-graylog2');
const WinstonSentry = require('winston-raven-sentry');

const logger = winston.createLogger({
    exitOnError: false
});

logger.add(new winston.transports.Console({
    format: winston.format.json(),
    level: 'silly',
    handleExceptions: true,
    prettyPrint: true
}));


if (process.env.GRAYLOG_HOST && process.env.GRAYLOG_PORT) {
    logger.add(new WinstonGrayLog2({
        name: "graylog",
            level: "debug",
            silent: false,
            handleExceptions: false,
            graylog: {
                servers: [
                    {
                        host: process.env.GRAYLOG_HOST,
                        port: process.env.GRAYLOG_PORT
                    }
                ]
            },
            staticMeta: {
                env: "prod"
            }
    }));
}

if (process.env.SENTRY_DSN) {
    logger.add(new WinstonSentry({
        level: "warn",
        dsn: process.env.SENTRY_DSN,
        captureUnhandledRejections: true
        // tags: { key: 'value' },
        // extra: { key: 'value' }
    }));
}

if (process.env.EXTLOG_HTTP_ENDPOINT) {
    const params = {
        level: 'debug',
        handleExceptions: true,
        format: winston.format.json(),
        host: process.env.EXTLOG_HTTP_ENDPOINT,
        port: process.env.EXTLOG_HTTP_ENDPOINT_PORT
    };
    if (_.has(process.env, 'EXTLOG_HTTP_ENDPOINT_HEADERS')) {
        params.headers = JSON.parse(process.env.EXTLOG_HTTP_ENDPOINT_HEADERS);
    }
    logger.add(new winston.transports.Http(params));
}

module.exports = logger;
