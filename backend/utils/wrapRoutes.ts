import { RequestHandler, Router } from 'express';
import { asyncHandler } from './errorHandler';

export const wrapRoutes = (router: Router): void => {
  // Wrap each route handler with asyncHandler
  router.stack.forEach((layer: any) => {
    if (layer.route) {
      layer.route.stack.forEach((routeLayer: any) => {
        routeLayer.handle = asyncHandler(routeLayer.handle as RequestHandler);
      });
    }
  });
};
