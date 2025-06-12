import { LogLevel, LogSource } from '@roshi/shared';
import { ERROR_KEYS } from '@roshi/shared/data/errorKeys';
import { Request } from 'express';
import { prismaClient } from '../clients/prismaClient';

export default async function logger({
  error,
  errorType,
  source,
  level,
  req,
}: {
  error: unknown;
  errorType: ERROR_KEYS;
  source: LogSource;
  level: LogLevel;
  req?: Request;
}) {
  try {
    console.error(JSON.stringify(error));
    const requestObj = !req
      ? undefined
      : {
          body: req.body,
          query: req.query,
          params: req.params,
          method: req.method,
          url: req.url,
          user: req.user?.sub,
        };

    const message = error instanceof Error ? error.message : JSON.stringify(error);
    const stack = error instanceof Error ? error.stack : undefined;
    await prismaClient.appLogs.create({
      data: {
        source,
        level,
        message: message,
        stack: stack,
        request: requestObj,
        errorType: errorType,
      },
    });
  } catch (logError) {
    console.error('!!!! Failed to log error:', logError);
  }
}
