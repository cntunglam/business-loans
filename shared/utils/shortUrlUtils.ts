import { randomBytes } from 'crypto';

export type ShortUrlType = 'REDIRECT' | 'API_ACCESS';

const REDIRECT_CODE_LENGTH = 8;
const API_CODE_LENGTH = 32;
const ALLOWED_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Generates a secure random string of specified length using only alphanumeric characters
 */
function generateSecureRandomString(length: number): string {
    const randomBytesCount = Math.ceil(length * 256 / ALLOWED_CHARS.length);
    const randBytes = randomBytes(randomBytesCount);
    let result = '';
    
    for (let i = 0; i < randomBytesCount && result.length < length; i++) {
        const randomIndex = randBytes[i] % ALLOWED_CHARS.length;
        result += ALLOWED_CHARS[randomIndex];
    }

    return result;
}

/**
 * Generates a short code based on the URL type
 * For redirects: shorter, user-friendly codes
 * For API access: longer, more secure tokens
 */
export function generateShortCode(type: ShortUrlType): string {
    const length = type === 'API_ACCESS' ? API_CODE_LENGTH : REDIRECT_CODE_LENGTH;
    
    return generateSecureRandomString(length);
}

/**
 * Validates if a given path string is in the correct format
 * Example valid paths: '/api/v1/loans', '/api/v1/*'
 */
export function validateApiPath(path: string): boolean {
    // Path must not be empty and must start with /
    if (!path || !path.startsWith('/')) {
        return false;
    }

    // Path should not have trailing slash unless it's just "/"
    if (path.length > 1 && path.endsWith('/')) {
        return false;
    }

    // No double slashes
    if (path.includes('//')) {
        return false;
    }

    // No query parameters or hash
    if (path.includes('?') || path.includes('#')) {
        return false;
    }

    // No path traversal
    if (path.includes('..')) {
        return false;
    }

    // Path should only contain alphanumeric characters, single forward slashes, hyphens, and wildcards
    const validPathRegex = /^\/(?:[a-zA-Z0-9\-_*]+(?:\/[a-zA-Z0-9\-_*]+)*)?$/;
    return validPathRegex.test(path);
}

/**
 * Checks if a given URL path matches any of the allowed paths
 * Supports wildcard matching (e.g., '/api/v1/*' matches '/api/v1/loans')
 */
export function isPathAllowed(requestPath: string, allowedPaths: string[]): boolean {
    return allowedPaths.some(allowedPath => {
        if (allowedPath.endsWith('*')) {
            const prefix = allowedPath.slice(0, -1);
            return requestPath.startsWith(prefix);
        }
        return requestPath === allowedPath;
    });
}
