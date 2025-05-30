import { ERROR_KEYS } from '@roshi/shared';
import compression from 'compression';
import cors from 'cors';
import { randomUUID } from 'crypto';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { disconnectPrisma } from './clients/prismaClient';
import { CONFIG } from './config';
import { accountRouter } from './routes/v1/account.route';
import { adminRouter } from './routes/v1/admin.route';
import { affiliateRouter } from './routes/v1/affiliate.route';
import { applicantInfoRouter } from './routes/v1/applicantInfo.route';
import { appointmentRouter } from './routes/v1/appointment.route';
import { companyRouter } from './routes/v1/company.route';
import { documentRouter } from './routes/v1/document.route';
import { healthRouter } from './routes/v1/health.route';
import { loanOfferRouter } from './routes/v1/loanOffer.route';
import { loanRequestRouter } from './routes/v1/loanRequest.route';
import { loanResponseRouter } from './routes/v1/loanResponse.route';
import { loggerRouter } from './routes/v1/logger.routes';
import { shortUrlRouter } from './routes/v1/shortUrl.route';
import { tokenRouter } from './routes/v1/token.route';
import { visitorRouter } from './routes/v1/visitor.route';
import { whatsppRouter } from './routes/v1/whatsapp.route';
import { updateUserSettings } from './services/account.service';
import { setupCronJobs } from './services/cronjob.service';
import { getShortUrlByCode, isPathAllowed } from './services/shortUrl.service';
import { asyncHandler, errorHandler } from './utils/errorHandler';
import { wrapRoutes } from './utils/wrapRoutes';

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

//V1 routes
const routers = [
  { path: '/health-check', router: healthRouter },
  {
    path: '/account',
    router: accountRouter,
  },
  { path: '/loan-request', router: loanRequestRouter },
  { path: '/loan-response', router: loanResponseRouter },
  { path: '/loan-offer', router: loanOfferRouter },
  { path: '/document', router: documentRouter },
  { path: '/token', router: tokenRouter },
  { path: '/admin', router: adminRouter },
  { path: '/company', router: companyRouter },
  { path: '/appointment', router: appointmentRouter },
  { path: '/whatsapp', router: whatsppRouter },
  { path: '/applicant', router: applicantInfoRouter },
  { path: '/visitor', router: visitorRouter },
  { path: '/logger', router: loggerRouter },
  { path: '/short-url', router: shortUrlRouter },
  { path: '/affiliate', router: affiliateRouter },
];
routers.forEach((r) => {
  wrapRoutes(r.router);
  app.use(`/api/v1${r.path}`, r.router);
});

if (CONFIG.NODE_ENV === 'development' || CONFIG.NODE_ENV === 'staging') {
  const webhookLogs: string[] = [];
  const whatsappLogs: string[] = [];
  //Handle webhooks in development
  app.post('/webhook-test', (req, res) => {
    webhookLogs.push(req.body);
    res.sendStatus(200);
  });
  app.get('/webhook-test', (req, res) => {
    res.send(webhookLogs);
  });

  //Handle whatsapp messages in development
  app.post('/whatsapp-test', (req, res) => {
    whatsappLogs.push(req.body);
    res.status(200).json({
      //Picky sends status 100 when successfull
      status: 100,
      push_id: randomUUID().toString(),
      message: req.body.data[0].message,
      data: [{ msg_id: randomUUID().toString(), number: req.body.data[0].number }],
    });
  });
  app.get('/whatsapp-test', (req, res) => {
    res.send(whatsappLogs);
  });
}

app.get('/mato-script', (req, res) => {
  fetch('https://mato.roshi.sg/js/container_t6uMiyE5.js')
    .then((response) => response.text())
    .then((text) => res.send(text));
});

app.get(
  '/l/:shortUrlCode',
  asyncHandler(async (req, res) => {
    const target = await getShortUrlByCode(req.params.shortUrlCode);
    if (!target || !target.targetUrl) {
      res.redirect(`${CONFIG.CLIENT_APP_URL}/error/${ERROR_KEYS.INVALID_OR_EXPIRED_LINK}`);
      return;
    }
    res.redirect(target.targetUrl);
  }),
);

// Handles various unsubscribe links
app.get(
  '/unsubscribe/:shortUrlCode',
  asyncHandler(async (req, res) => {
    const shortUrl = await getShortUrlByCode(req.params.shortUrlCode);
    if (shortUrl && shortUrl.user?.email && isPathAllowed(shortUrl, '/api/v1/account/user-settings')) {
      const autoReapplyDisabled =
        req.query.autoReapplyDisabled === undefined ? undefined : req.query.autoReapplyDisabled === 'true';
      const emailNotificationsDisabled =
        req.query.emailNotificationsDisabled === undefined
          ? undefined
          : req.query.emailNotificationsDisabled === 'true';
      await updateUserSettings(shortUrl.user.email, { autoReapplyDisabled, emailNotificationsDisabled });
    }
    res.redirect(`${CONFIG.CLIENT_APP_URL}/unsubscribe`);
  }),
);

app.use(errorHandler);

setupCronJobs();
// seedData();

const server = app.listen(CONFIG.PORT, () => {
  console.log(`App listening on port ${CONFIG.PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  await disconnectPrisma();
  server.close(() => {
    console.log('Closed out remaining connections.');
    process.exit(0);
  });

  // If server close takes too long, force exit
  setTimeout(() => {
    console.error('Forcing shutdown...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
