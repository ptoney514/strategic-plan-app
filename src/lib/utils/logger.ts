/**
 * Development-only logger utility
 *
 * Wraps console methods to only log in development mode.
 * In production, most logging is silently ignored.
 *
 * Usage:
 * ```ts
 * import { logger } from '@/lib/utils/logger';
 *
 * logger.debug('Debug message'); // Only in dev
 * logger.info('Info message');   // Only in dev
 * logger.warn('Warning');        // Only in dev
 * logger.error('Error', error);  // Always logged (for error tracking)
 * ```
 */

const isDev = import.meta.env.DEV;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  prefix?: string;
  timestamp?: boolean;
}

function formatMessage(level: LogLevel, prefix?: string, timestamp?: boolean): string[] {
  const parts: string[] = [];

  if (timestamp) {
    parts.push(`[${new Date().toISOString()}]`);
  }

  if (prefix) {
    parts.push(`[${prefix}]`);
  }

  parts.push(`[${level.toUpperCase()}]`);

  return parts;
}

/**
 * Create a namespaced logger
 *
 * @example
 * const log = createLogger('GoalsService');
 * log.debug('Fetching goals...'); // [GoalsService] [DEBUG] Fetching goals...
 */
export function createLogger(prefix: string, options: Omit<LoggerOptions, 'prefix'> = {}) {
  return {
    debug: (...args: unknown[]) => {
      if (isDev) {
        console.log(...formatMessage('debug', prefix, options.timestamp), ...args);
      }
    },
    info: (...args: unknown[]) => {
      if (isDev) {
        console.info(...formatMessage('info', prefix, options.timestamp), ...args);
      }
    },
    warn: (...args: unknown[]) => {
      if (isDev) {
        console.warn(...formatMessage('warn', prefix, options.timestamp), ...args);
      }
    },
    error: (...args: unknown[]) => {
      // Errors are always logged, even in production
      console.error(...formatMessage('error', prefix, options.timestamp), ...args);
    },
  };
}

/**
 * Default logger instance
 *
 * Use for general logging. For service-specific logging,
 * create a namespaced logger with createLogger().
 */
export const logger = {
  /**
   * Debug level - only in development
   * Use for detailed debugging information
   */
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info level - only in development
   * Use for general information
   */
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Warn level - only in development
   * Use for warnings that don't break functionality
   */
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Error level - always logged
   * Use for errors that need attention
   */
  error: (...args: unknown[]) => {
    // Errors are always logged (could be sent to error tracking in production)
    console.error('[ERROR]', ...args);
  },

  /**
   * Table logging - only in development
   * Use for displaying data in table format
   */
  table: (data: unknown) => {
    if (isDev) {
      console.table(data);
    }
  },

  /**
   * Group logging - only in development
   * Use for grouping related logs
   */
  group: (label: string) => {
    if (isDev) {
      console.group(label);
    }
  },

  groupEnd: () => {
    if (isDev) {
      console.groupEnd();
    }
  },
};

/**
 * Pre-configured service loggers
 */
export const serviceLoggers = {
  auth: createLogger('Auth'),
  goals: createLogger('GoalsService'),
  metrics: createLogger('MetricsService'),
  import: createLogger('ImportService'),
  districts: createLogger('DistrictService'),
};
