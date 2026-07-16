/**
 * Minimal error-reporting abstraction.
 *
 * Centralises how the app reports errors so a real provider (Sentry, Highlight,
 * Axiom…) can be wired in one place. Until one is configured it logs to the
 * console with structured context. Safe to call from both server and client.
 */

type Context = Record<string, unknown>;

export function captureError(error: unknown, context?: Context) {
  const err = error instanceof Error ? error : new Error(String(error));

  // Integration point: forward to Sentry/etc here, e.g.
  //   Sentry.captureException(err, { extra: context });
  if (process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.error("[capture]", err.message, {
      stack: err.stack,
      ...context,
    });
  }
}

export function captureMessage(message: string, context?: Context) {
  if (process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.warn("[capture]", message, context);
  }
}
