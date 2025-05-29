import { AxiosError } from "axios";
import { differenceInSeconds, format, fromUnixTime, startOfDay, subDays, subMonths } from "date-fns";
import { getTimezoneOffset } from "date-fns-tz";
import { URLSearchParams } from "url";
import { CONSTANTS } from "../data/constants";

export const encodeQueryData = (data: Record<string, string>) => {
  const ret = [];
  for (const d in data) {
    ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
  }
  return ret.join("&");
};

export const formatToDisplayString = (value?: string | number, significantDigits = 6) => {
  if (value === undefined) return "";
  const nbr = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(nbr)) return "";
  return nbr.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: significantDigits });
};

export const formatError = (error: unknown) => {
  if (!error) return "";
  let res = "";
  if (typeof error === "object" && "shortMessage" in error) res = error.shortMessage as string;
  else if (typeof error === "string") res = error;
  else if (error instanceof AxiosError) res = error.response?.data.error;
  else if (error instanceof Error) res = error.message;
  else res = JSON.stringify(error);

  return res;
};

export const generateRandomString = (length: number) => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));
  return result;
};

export function buildQueryClauses(query: URLSearchParams) {
  const where: { [key: string]: string } = {};
  const orderBy: { [key: string]: string } = {};

  for (const key of Object.keys(query)) {
    // Assume any param ending in "OrderBy" is for ordering, others are for filtering
    if (key.endsWith("OrderBy")) {
      const field = key.slice(0, -7); // Remove 'OrderBy' from the key
      orderBy[field] = query.get(key) as string;
    } else {
      where[key] = query.get(key) as string;
    }
  }

  return { where, orderBy: Object.keys(orderBy).length ? orderBy : undefined };
}

export function convertParamsToString(searchParams: Record<string, string | number | boolean | undefined>) {
  return Object.entries(searchParams)
    .filter(([key, value]) => key && value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
    .join("&");
}

export const getDifference = (date?: Date) => {
  if (!date) return "";
  const seconds = differenceInSeconds(new Date(), date);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  return `${years}y`;
};

export const getFullTimeDifference = (date?: Date) => {
  if (!date) return "";
  const seconds = differenceInSeconds(new Date(), date);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h ${minutes % 60}m`;
};

export const formatMonths = (months: number) => {
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return `${years} years ${remainingMonths} months`;
};

//Sort any item into periods. Param must be any array of items with a createdAt field
export function sortIntoPeriods<T extends { createdAt: Date }>(toSort: T[]) {
  const now = new Date();
  const today = startOfDay(now);
  const lastWeek = subDays(now, 7);
  const lastMonth = subMonths(now, 1);
  const last6Month = subMonths(now, 6);
  const lastYear = subMonths(now, 12);

  const sorted = {
    today: [] as T[],
    "last 7 days": [] as T[],
    "last 30 days": [] as T[],
    "last 6 months": [] as T[],
    "last year": [] as T[],
    "all time": [] as T[],
  };

  toSort.forEach((item) => {
    if (item.createdAt > today) sorted["today"].push(item);
    else if (item.createdAt > lastWeek) sorted["last 7 days"].push(item);
    else if (item.createdAt > lastMonth) sorted["last 30 days"].push(item);
    else if (item.createdAt > last6Month) sorted["last 6 months"].push(item);
    else if (item.createdAt > lastYear) sorted["last year"].push(item);
    else sorted["all time"].push(item);
  });

  return sorted;
}

export const numberToDayOfWeek = (number: number) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[number];
};

export const extractTextFromHTML = (html: string) => {
  const res: string[] = [];
  const text = html.match(/<li>(.*?)<\/li>/g);
  if (text) {
    text.forEach((t) => {
      res.push(t.replace(/<\/?li>/g, ""));
    });
    return res;
  } else {
    res.push(html);
    return res;
  }
};

export const getCurrentTime = () => {
  const currDateWithTz = new Date();
  const currUtcTimestamp = currDateWithTz.getTime() + currDateWithTz.getTimezoneOffset() * 60 * 1000;
  const dateWithTz = fromUnixTime(
    Math.floor((currUtcTimestamp + getTimezoneOffset(CONSTANTS.TIMEZONE, new Date())) / 1000)
  );
  return new Date(format(dateWithTz, "yyyy-MM-dd'T'HH:mm':00Z'"));
};

export const generateWhatsappLink = (phoneNumber: string, text?: string) => {
  if (!text) return `whatsapp://send/?phone=${encodeURIComponent(phoneNumber)}&text&type=phone_number&app_absent=0`;
  return `whatsapp://send/?phone=${encodeURIComponent(phoneNumber)}&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`;
};

export const generateWhatsappLinkForUser = (phoneNumber: string, text?: string) => {
  if (!text) return `https://wa.me/${encodeURIComponent(phoneNumber)}?text&type=phone_number&app_absent=0`;
  return `https://wa.me/${encodeURIComponent(phoneNumber)}?text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`;
};

export const isImageUrl = (url: string) => {
  return /[/.](gif|jpg|jpeg|tiff|png)$/i.test(url);
};

export const formattedDate = (date: Date, formatStr = "dd/MM/yyyy HH:mm") => {
  if (!date) {
    throw new Error("Invalid date: date is required");
  }

  return format(date, formatStr);
};
