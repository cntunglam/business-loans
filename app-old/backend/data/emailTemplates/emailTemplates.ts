import { readFileSync } from 'fs';
import { CONFIG } from '../../config';

const getFile = (filename: string) => readFileSync(`${__dirname}/${filename}.html`, 'utf-8');

const container = getFile('emailContainer');
const emailContainerWithoutLogo = getFile('emailContainerWithoutLogo');

const commonVariables = {
  date: new Date().getFullYear().toString(),
  title: 'ROSHI',
  appUrl: CONFIG.CLIENT_APP_URL,
  userDashboardUrl: `${CONFIG.CLIENT_APP_URL}/user/dashboard`,
  lenderSettingsUrl: `${CONFIG.CLIENT_APP_URL}/lender/settings`,
};

export const emailTemplates = {
  welcome: {
    html: getFile('welcome'),
    variables: (data: { fullName: string }) => data,
    withoutContainerLogo: true,
  },
  otp: {
    html: getFile('otp'),
    variables: (data: { otp: string }) => data,
    withoutContainerLogo: true,
  },
  loanOfferReceived: {
    html: getFile('loanOfferReceived'),
    variables: (data: { bookingUrl: string; offersCount: string; offers: string }) => ({ ...data, ...commonVariables }),
    withoutContainerLogo: true,
  },
  newLoanRequest: {
    html: getFile('newLoanRequest'),
    variables: (data: {
      amount: string;
      purpose: string;
      term: string;
      monthlyIncome: string;
      residencyStatus: string;
      loanRequestLink: string;
    }) => data,
    withoutContainerLogo: true,
  },
  //With time and store
  appointmentScheduled: {
    html: getFile('appointmentScheduled'),
    variables: (data: { lenderName: string; scheduleTime: string; mapsUrl: string; address: string; link: string }) =>
      data,
  },
  cancelAppointment: {
    html: getFile('cancelAppointment'),
    variables: (data: { link: string }) => data,
  },
  selectOffer: {
    html: getFile('selectOffer'),
    variables: (data: { link: string }) => data,
    withoutLogo: true,
  },
  autoIPA: {
    html: getFile('autoIPA'),
    variables: (data: { link: string; amount: string; interestRate: string }) => data,
  },
} as const;

export const generateEmail = <T extends keyof typeof emailTemplates>(
  template: T,
  data: Parameters<(typeof emailTemplates)[T]['variables']>[0],
  containerData?: { unsubscribe?: string; footerSlot?: string },
) => {
  const templateVars: Record<string, string> = {
    ...data,
    ...commonVariables,
  };

  const body = emailTemplates[template].html.replace(/{#(.*?)#}/g, (_, key) => templateVars[key]);

  const containerVars: Record<string, string> = {
    body,
    ...commonVariables,
    ...containerData,
  };
  if ((emailTemplates[template] as { withoutContainerLogo?: boolean })?.withoutContainerLogo) {
    return emailContainerWithoutLogo.replace(/{#(.*?)#}/g, (_, key) => containerVars[key]);
  }
  return container.replace(/{#(.*?)#}/g, (_, key) => containerVars[key]);
};
