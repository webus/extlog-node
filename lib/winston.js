const winston = require('winston');
const WinstonGrayLog2 = require('winston-graylog2');
const WinstonSentry = require('winston-sentry');

const logger = new winston.Logger({
    transports: [
        new (winston.transports.Console)({
            timestamp: true,
            handleExceptions: true,
            json: false,
            level: process.env.LOG_LEVEL || "silly",
            prettyPrint: true,
            colorize: true
        }),
        new (WinstonGrayLog2)({
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
        }),
        new (WinstonSentry)({
            level: "warn",
            dsn: process.env.SENTRY_DSN,
            patchGlobal: true,
            tags: { key: 'value' },
            extra: { key: 'value' }
        })
    ]
});

module.exports = logger;
