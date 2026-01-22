/**
 * Logger Utility
 * Simple logging utility for the application
 */

interface Colors {
  reset: string;
  red: string;
  yellow: string;
  blue: string;
  gray: string;
  cyan: string;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  [key: string]: any;
}

const colors: Colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
};

class Logger {
  static log(level: string, message: string, meta: Record<string, any> = {}): void {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      ...meta
    };

    let color = colors.reset;
    switch (level.toUpperCase()) {
      case 'ERROR':
        color = colors.red;
        break;
      case 'WARN':
        color = colors.yellow;
        break;
      case 'INFO':
        color = colors.blue;
        break;
      case 'DEBUG':
        color = colors.gray;
        break;
    }

    console.log(`${color}[${timestamp}] ${level}: ${message}${colors.reset}`);

    // Also log metadata if present
    if (Object.keys(meta).length > 0) {
      console.log(`${colors.cyan}Meta:`, meta, `${colors.reset}`);
    }
  }

  static error(message: string, meta: Record<string, any> = {}): void {
    this.log('ERROR', message, meta);
  }

  static warn(message: string, meta: Record<string, any> = {}): void {
    this.log('WARN', message, meta);
  }

  static info(message: string, meta: Record<string, any> = {}): void {
    this.log('INFO', message, meta);
  }

  static debug(message: string, meta: Record<string, any> = {}): void {
    this.log('DEBUG', message, meta);
  }
}

export default Logger;
