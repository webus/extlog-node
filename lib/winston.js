const _ = require('lodash');
const winston = require('winston');
const WinstonGrayLog2 = require('winston-graylog2');
const WinstonSentry = require('winston-raven-sentry');

const logger = winston.createLogger({
    exitOnError: false
});

const customFormat = winston.format.printf(info => {
    const data = _.cloneDeep(info);
    const ts = _.get(data, 'timestamp');
    const level = _.toUpper(_.get(data, 'level'));
    const msg = _.get(data, 'message');
    delete data['timestamp'];
    delete data['level'];
    delete data['message'];
    if (Object.keys(data).length > 0) {
        return `${ts} ${level} ${msg} ${JSON.stringify(data, null, 1)}`;
    }
    return `${ts} ${level} ${msg}`;
});

logger.add(new winston.transports.Console({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        customFormat
    ),
    level: 'silly',
    handleExceptions: true
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
