import { UserRoleEnum } from '@roshi/shared';
import { format, fromUnixTime, getHours } from 'date-fns';
import { getTimezoneOffset, toZonedTime } from 'date-fns-tz';
import { CONFIG } from '../config';

export function parseJsonValues(obj: any): any {
  if (Array.isArray(obj)) {
    return obj;
  }

  if (typeof obj !== 'object') {
    if (obj === undefined || obj === null) return obj;
    return JSON.parse(obj);
  }

  const parsedObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      parsedObj[key] = parseJsonValues(obj[key]);
    }
  }

  return parsedObj;
}

export function getMimeType(extension: string) {
  switch (extension.toLowerCase()) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.bmp':
      return 'image/bmp';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream'; // default fallback
  }
}

export function isUUIDv4(s: string): boolean {
  const pattern = /^[a-fA-F\d]{8}-[a-fA-F\d]{4}-4[a-fA-F\d]{3}-[89abAB][a-fA-F\d]{3}-[a-fA-F\d]{12}$/;
  return pattern.test(s);
}

export const getCurrentTime = () => {
  const currDateWithTz = new Date();
  const currUtcTimestamp = currDateWithTz.getTime() + currDateWithTz.getTimezoneOffset() * 60 * 1000;
  const dateWithTz = fromUnixTime(
    Math.floor((currUtcTimestamp + getTimezoneOffset(CONFIG.TIMEZONE, new Date())) / 1000),
  );
  return new Date(format(dateWithTz, "yyyy-MM-dd'T'HH:mm':00Z'"));
};

export function roundUpToThousand(num: number): number {
  return Math.ceil(num / 1000) * 1000;
}

export const getClientLink = (role: UserRoleEnum, loanRequestId?: string) => {
  let path = '/apply';
  if (role === UserRoleEnum.ADMIN) path = `/admin/dashboard?loanRequest=${loanRequestId}`;
  else if (role === UserRoleEnum.LENDER) path = `/lender/dashboard?tab=all&loanRequest=${loanRequestId}`;
  else if (role === UserRoleEnum.BORROWER) path = `/user/dashboard`;
  return `${CONFIG.CLIENT_APP_URL}${path}`;
};

export const isCurrentTimeAppropriate = () => {
  const currentTime = toZonedTime(new Date(), CONFIG.TIMEZONE);
  if (getHours(currentTime) > 23 || getHours(currentTime) < 9) return false;
  return true;
};

export function addProp<T extends object, K extends PropertyKey, V>(
  obj: T,
  key: K,
  value: V,
): asserts obj is T & { [P in K]: V } {
  Object.assign(obj, { [key]: value });
}

export function safeDivide(numerator?: number, denominator?: number): number {
  if (
    typeof numerator !== 'number' ||
    typeof denominator !== 'number' ||
    isNaN(numerator) ||
    isNaN(denominator) ||
    denominator === 0
  ) {
    return 0;
  }

  return numerator / denominator;
}
