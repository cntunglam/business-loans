import { ShortUrl, ShortUrlTypeEnum } from '@roshi/shared';
import { generateShortCode, validateApiPath } from '@roshi/shared/utils/shortUrlUtils';
import { addDays } from 'date-fns';
import { prismaClient } from '../clients/prismaClient';
import { CONFIG } from '../config';

export class ShortUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShortUrlError';
  }
}

export interface CreateShortUrlOptions {
  targetUrl?: string;
  type: ShortUrlTypeEnum;
  userId: string;
  expiresAt?: Date;
  allowedPaths?: string[];
}

/**
 * Creates a new short URL
 * @throws {ShortUrlError} If validation fails
 */
export async function createShortUrl(options: CreateShortUrlOptions): Promise<ShortUrl> {
  const { targetUrl, type, userId, expiresAt, allowedPaths } = options;

  if (options.type === ShortUrlTypeEnum.REDIRECT) {
    //Check if redirect url already exists for same url
    const existing = await prismaClient.shortUrl.findFirst({
      where: { userId, targetUrl, type: ShortUrlTypeEnum.REDIRECT, expiresAt: { gte: new Date() } },
    });
    if (existing) return existing;
  }

  if (type === ShortUrlTypeEnum.API_ACCESS) {
    // Validate based on type
    if (!allowedPaths?.length) {
      throw new ShortUrlError('API_ACCESS type requires allowedPaths');
    }
    // Validate each path
    for (const path of allowedPaths) {
      if (!validateApiPath(path)) {
        throw new ShortUrlError(`Invalid API path format: ${path}`);
      }
    }
  } else if (type === ShortUrlTypeEnum.REDIRECT) {
    try {
      new URL(targetUrl!);
    } catch {
      throw new ShortUrlError('Invalid target URL format');
    }
  } else {
    throw new ShortUrlError('Invalid type. Must be either REDIRECT or API_ACCESS');
  }

  // Generate a unique code
  let code: string;
  let attempts = 0;
  const maxAttempts = 5;

  do {
    code = generateShortCode(type);
    const existing = await prismaClient.shortUrl.findUnique({
      where: { code },
    });
    if (!existing) break;
    attempts++;
  } while (attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    throw new ShortUrlError('Failed to generate unique code after multiple attempts');
  }

  // Create the short URL
  return prismaClient.shortUrl.create({
    data: {
      code,
      targetUrl,
      type,
      userId,
      //Link is valid for 7 days by default for API ACCESS links
      expiresAt: (expiresAt ?? type === ShortUrlTypeEnum.API_ACCESS) ? addDays(new Date(), 15) : undefined,
      allowedPaths: allowedPaths || [],
      useCount: 0,
    },
  });
}

/**
 * Retrieves a short URL by its code
 * Updates usage statistics if found
 */
export async function getShortUrlByCode(code: string) {
  const shortUrl = await prismaClient.shortUrl.findUnique({
    where: { code },
    include: {
      user: { select: { companyId: true, id: true, role: true, email: true } },
    },
  });

  if (!shortUrl) {
    return null;
  }

  // Check expiration
  if (shortUrl.expiresAt && shortUrl.expiresAt < new Date()) {
    return null;
  }

  // Update usage statistics
  await prismaClient.shortUrl.update({
    where: { id: shortUrl.id },
    data: {
      useCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  });

  return shortUrl;
}

/**
 * Lists all short URLs for a user
 */
export async function listUserShortUrls(userId: string): Promise<ShortUrl[]> {
  return prismaClient.shortUrl.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Deletes a short URL
 * Only allows deletion by the owner
 */
export async function deleteShortUrl(code: string, userId: string): Promise<boolean> {
  const result = await prismaClient.shortUrl.deleteMany({
    where: {
      code,
      userId,
    },
  });
  return result.count > 0;
}

/**
 * Checks if a path is allowed for an API access short URL
 */
export function isPathAllowed(shortUrl: ShortUrl, path: string): boolean {
  if (shortUrl.type !== ShortUrlTypeEnum.API_ACCESS) {
    return false;
  }
  return shortUrl.allowedPaths.some((allowedPath) => {
    const regex = new RegExp(`^${allowedPath.replace(/\*/g, '.*')}$`);
    return regex.test(path);
  });
}

export async function generateBookingUrl(userId: string) {
  const shortCode = await createShortUrl({
    type: ShortUrlTypeEnum.API_ACCESS,
    userId: userId,
    allowedPaths: ['/api/v1/loan-request/me', '/api/v1/company/*/store', '/api/v1/appointment'],
  });

  return `${CONFIG.CLIENT_APP_URL}/book/${shortCode.code}`;
}
