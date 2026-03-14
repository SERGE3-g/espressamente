/**
 * Logger leggero per il frontend admin.
 * - In sviluppo: logga tutto (debug, info, warn, error)
 * - In produzione: logga solo warn e error
 *
 * Uso: import { logger } from "@/lib/logger";
 *       logger.info("Prodotto creato", { id: 42 });
 */

const isDev = process.env.NODE_ENV === "development";

type LogData = Record<string, unknown> | string | number | undefined;

function formatMessage(level: string, message: string, data?: LogData): string {
  const time = new Date().toLocaleTimeString("it-IT", { hour12: false });
  return `[${time}] [${level}] ${message}`;
}

export const logger = {
  debug(message: string, data?: LogData) {
    if (isDev) {
      console.debug(formatMessage("DEBUG", message), data ?? "");
    }
  },

  info(message: string, data?: LogData) {
    if (isDev) {
      console.info(formatMessage("INFO", message), data ?? "");
    }
  },

  warn(message: string, data?: LogData) {
    console.warn(formatMessage("WARN", message), data ?? "");
  },

  error(message: string, error?: unknown) {
    const errorData = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    console.error(formatMessage("ERROR", message), errorData ?? "");
  },

  /** Log specifico per le API call */
  api(method: string, endpoint: string, status: number, durationMs: number) {
    const msg = `${method} ${endpoint} → ${status} (${durationMs}ms)`;
    if (status >= 500) {
      console.error(formatMessage("API", msg));
    } else if (status >= 400) {
      console.warn(formatMessage("API", msg));
    } else if (isDev) {
      console.info(formatMessage("API", msg));
    }
  },
};
