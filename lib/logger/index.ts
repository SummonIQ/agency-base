import pino, { Logger } from 'pino';
import pretty from 'pino-pretty';

const stream = pretty({
  colorize: true,
});
export const logger: Logger =
  process.env['NODE_ENV'] === 'production'
    ? // JSON in production
      pino({ level: 'warn' }, stream)
    : // Pretty print in development
      pino(
        {
          level: 'debug',
          transport: {
            options: {
              colorize: true,
            },
            target: 'pino-pretty',
          },
        },
        stream,
      );
