import { ERROR_KEYS } from '@roshi/shared';

export class RoshiError extends Error {
  code: ERROR_KEYS;
  fields: Record<string, string>;
  originalError: unknown;

  constructor(
    code: ERROR_KEYS,
    options: { originalError?: unknown; message?: string; fields?: Record<string, string> } = {},
  ) {
    super(code);
    this.message = options.message || code;
    this.fields = options.fields || {};
    this.code = code;
    this.originalError = options.originalError;
    Object.setPrototypeOf(this, RoshiError.prototype);
  }
}
