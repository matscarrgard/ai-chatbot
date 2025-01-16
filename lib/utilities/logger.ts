import chalk, { ChalkInstance } from 'chalk';
import path from 'path';

// Enable chalk colors
chalk.level = 2;

// Define log levels with DEBUG as most verbose
export const enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
}

// Define valid log level strings
type LogLevelString = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

// Helper function to determine if we're running on server
const isServer = typeof window === 'undefined';

// Configure the log level from the environment variable
const getLogLevel = (): LogLevel => {
  if (isServer) {
    return process.env.LOG_LEVEL?.toUpperCase() === 'DEBUG'
      ? LogLevel.DEBUG
      : process.env.LOG_LEVEL?.toUpperCase() === 'INFO' 
      ? LogLevel.INFO 
      : process.env.LOG_LEVEL?.toUpperCase() === 'WARN'
      ? LogLevel.WARN
      : process.env.LOG_LEVEL?.toUpperCase() === 'ERROR'
      ? LogLevel.ERROR
      : process.env.NODE_ENV === 'development'
      ? LogLevel.DEBUG
      : LogLevel.NONE;
  }
  
  return process.env.NEXT_PUBLIC_LOG_LEVEL?.toUpperCase() === 'DEBUG'
    ? LogLevel.DEBUG
    : process.env.NEXT_PUBLIC_LOG_LEVEL?.toUpperCase() === 'INFO'
    ? LogLevel.INFO
    : process.env.NEXT_PUBLIC_LOG_LEVEL?.toUpperCase() === 'WARN'
    ? LogLevel.WARN
    : process.env.NEXT_PUBLIC_LOG_LEVEL?.toUpperCase() === 'ERROR'
    ? LogLevel.ERROR
    : process.env.NODE_ENV === 'development'
    ? LogLevel.DEBUG
    : LogLevel.NONE;
};

const logLevel = getLogLevel();

// Helper function to format timestamp in local time
const getTimestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  });
};

// Helper function to format arguments with better object handling
const formatArgs = (args: any[]): string => {
  return args.map(arg => {
    if (arg instanceof Error) {
      return `${arg.message}\n${arg.stack}`;
    }
    return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
  }).join(' ');
};

// Helper function to get the calling file path
const getCallerFile = () => {
  const error = new Error();
  const stack = error.stack?.split('\n');
  
  // Find the first line that's not from this file
  const callerLine = stack?.find(line => 
    line.includes('at ') && 
    !line.includes('getCallerFile') && 
    !line.includes('createLogger')
  );

  if (!callerLine) return 'unknown';

  try {
    // Extract file path from the stack trace
    const match = callerLine.match(/\(([^)]+)\)/);
    if (!match) return 'unknown';

    const fullPath = match[1].split(':')[0];
    // Get path relative to project root
    const projectRoot = process.cwd();
    const relativePath = path.relative(projectRoot, fullPath)
      .replace(/\\/g, '/') // Normalize path separators
      .replace(/\.(ts|tsx|js|jsx)$/, ''); // Remove file extension
    
    return relativePath;
  } catch (error) {
    return 'unknown';
  }
};

// Create colored text regardless of environment
const colorize = (text: string, level: LogLevelString): string => {
  const colorMap: Record<LogLevelString, (text: string) => string> = {
    DEBUG: (t) => chalk.magenta(t),
    INFO: (t) => chalk.blue(t),
    WARN: (t) => chalk.yellow(t),
    ERROR: (t) => chalk.red(t)
  };

  return colorMap[level](text);
};

// Format the log message
const formatLogMessage = (level: LogLevelString, context: string, args: any[]) => {
  const timestamp = getTimestamp();
  const formattedArgs = formatArgs(args);
  
  // Use the same coloring logic for both server and client
  return `${chalk.gray(timestamp)} ${colorize(`[${level}]`, level)} ${chalk.cyan(`[${context}]`)} ${formattedArgs}`;
};

// Logger factory that creates a logger instance with component context
export const createLogger = (componentName?: string) => {
  const filePath = getCallerFile();
  const context = componentName || filePath;
  
  return {
    debug: (...args: any[]) => {
      if (logLevel >= LogLevel.DEBUG) {
        console.debug(formatLogMessage('DEBUG', context, args));
      }
    },
    info: (...args: any[]) => {
      if (logLevel >= LogLevel.INFO) {
        console.log(formatLogMessage('INFO', context, args));
      }
    },
    warn: (...args: any[]) => {
      if (logLevel >= LogLevel.WARN) {
        console.warn(formatLogMessage('WARN', context, args));
      }
    },
    error: (...args: any[]) => {
      if (logLevel >= LogLevel.ERROR) {
        console.error(formatLogMessage('ERROR', context, args));
      }
    },
  };
};