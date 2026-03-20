export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

function createLogger(level: LogLevel = 'info'): Logger {
  const timestamp = () => new Date().toISOString();

  const format = (lvl: LogLevel, message: string, args: unknown[]) => {
    const prefix = `${timestamp()} [${lvl.toUpperCase()}]`;
    if (args.length > 0) {
      return `${prefix} ${message} ${args.map(a => JSON.stringify(a)).join(' ')}`;
    }
    return `${prefix} ${message}`;
  };

  return {
    debug(message: string, ...args: unknown[]) {
      if (level === 'debug') console.debug(format('debug', message, args));
    },
    info(message: string, ...args: unknown[]) {
      console.info(format('info', message, args));
    },
    warn(message: string, ...args: unknown[]) {
      console.warn(format('warn', message, args));
    },
    error(message: string, ...args: unknown[]) {
      console.error(format('error', message, args));
    },
  };
}

export const logger = createLogger(process.env.LOG_LEVEL as LogLevel || 'info');

export function createLoggerWithPrefix(prefix: string): Logger {
  return {
    debug(message: string, ...args: unknown[]) {
      logger.debug(`[${prefix}] ${message}`, ...args);
    },
    info(message: string, ...args: unknown[]) {
      logger.info(`[${prefix}] ${message}`, ...args);
    },
    warn(message: string, ...args: unknown[]) {
      logger.warn(`[${prefix}] ${message}`, ...args);
    },
    error(message: string, ...args: unknown[]) {
      logger.error(`[${prefix}] ${message}`, ...args);
    },
  };
}
