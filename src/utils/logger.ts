export enum LogLevel {
  DEBUG = 'DEBUG',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: unknown;
}

const DEBUG_LOGGING_STORAGE_KEY = 'snoozrDebugLoggingEnabled';

// Default to false, will be updated from storage.
let debugLogsEnabled = false;

// Asynchronously load the debug setting when the module is imported.
(async () => {
  try {
    const result = await chrome.storage.local.get(DEBUG_LOGGING_STORAGE_KEY);
    if (result[DEBUG_LOGGING_STORAGE_KEY] !== undefined) {
      debugLogsEnabled = Boolean(result[DEBUG_LOGGING_STORAGE_KEY]);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Snoozr Logger: Could not load debug setting from storage', e);
    // Keep the default value if storage access fails.
  }
})();

/**
 * Sets the debug logging preference and stores it in chrome.storage.local.
 * @param enabled - True to enable debug logs, false to disable.
 */
export async function setDebugLoggingPreference(
  enabled: boolean
): Promise<void> {
  debugLogsEnabled = enabled;
  try {
    await chrome.storage.local.set({ [DEBUG_LOGGING_STORAGE_KEY]: enabled });
    // eslint-disable-next-line no-console
    console.info(`Snoozr Logger: Debug logging preference set to ${enabled}`);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Snoozr Logger: Could not save debug setting to storage', e);
  }
}

function formatLog(entry: LogEntry): string {
  let logString = `${entry.timestamp} [${entry.level}] ${entry.message}`;
  if (entry.context !== undefined) {
    try {
      logString += ` | Context: ${JSON.stringify(entry.context)}`;
    } catch (e) {
      logString += ` | Context: (Unserializable)`;
    }
  }
  return logString;
}

export function log(level: LogLevel, message: string, context?: unknown): void {
  if (level === LogLevel.DEBUG && !debugLogsEnabled) {
    return;
  }

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };

  switch (level) {
    case LogLevel.DEBUG:
      // eslint-disable-next-line no-console
      console.debug(formatLog(entry));
      break;
    case LogLevel.WARN:
      // eslint-disable-next-line no-console
      console.warn(formatLog(entry));
      break;
    case LogLevel.ERROR:
      // eslint-disable-next-line no-console
      console.error(formatLog(entry));
      break;
    default:
      // This case should ideally not be reached if LogLevel enum is used correctly.
      // eslint-disable-next-line no-console
      console.log(`[UNKNOWN_LEVEL] ${formatLog(entry)}`);
  }
}

export const logger = {
  debug: (message: string, context?: unknown) =>
    log(LogLevel.DEBUG, message, context),
  warn: (message: string, context?: unknown) =>
    log(LogLevel.WARN, message, context),
  error: (message: string, context?: unknown) =>
    log(LogLevel.ERROR, message, context),
};
