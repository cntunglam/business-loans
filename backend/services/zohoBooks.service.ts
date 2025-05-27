import { ERROR_KEYS, LoanOffer, LoanResponse, LogLevel, LogSource, shortId, StatusEnum } from '@roshi/shared';
import { endOfMonth, subMonths } from 'date-fns';
import { prismaClient } from '../clients/prismaClient';
import { zohoClient } from '../clients/zohoClient';
import logger from '../utils/logger';
import { RoshiError } from '../utils/roshiError';

const DEFAULT_ROSHI_FEE = 0.05;

export const generateInvoicesForLastMonth = async () => {
  const lastDayPrevMonth = endOfMonth(subMonths(new Date(), 1));
  lastDayPrevMonth.setHours(23, 59, 0, 0);
  await generateInvoices(lastDayPrevMonth);
};

export const generateInvoices = async (since: Date) => {
  console.log('Generating invoices since: ', since);

  const wonLoanResponses = await prismaClient.loanResponse.findMany({
    where: {
      outcomeStatus: StatusEnum.APPROVED,
      closedDealOffer: { createdAt: { gte: since } },
      invoiceId: null,
    },
    include: {
      closedDealOffer: true,
      lender: { select: { zohoCustomerId: true, name: true, commission: true } },
    },
  });

  console.log('Found loan requests to bill', wonLoanResponses.length);

  //Key is companyId
  const invoices: Record<
    string,
    Array<{ zohoCustomerId: string; loanResponse: LoanResponse; closedDealOffer: LoanOffer; commission: number }>
  > = {};

  for (const loanResponse of wonLoanResponses) {
    if (!loanResponse || !loanResponse.closedDealOffer) {
      logger({
        error: new RoshiError(ERROR_KEYS.INTERNAL_ERROR, {
          message: 'encountered fullfilled loan request without approved loan response or without closedDealOffer',
        }),
        source: LogSource.CRON_JOB,
        level: LogLevel.ERROR,
        errorType: ERROR_KEYS.INTERNAL_ERROR,
      });
      continue;
    }
    if (!loanResponse.lender.zohoCustomerId) {
      console.log('Unsupported company for generating invoice');
      continue;
    }

    if (!(loanResponse.lenderId in invoices)) {
      invoices[loanResponse.lenderId] = [];
    }

    invoices[loanResponse.lenderId].push({
      zohoCustomerId: loanResponse.lender.zohoCustomerId,
      commission: loanResponse.lender.commission || DEFAULT_ROSHI_FEE,
      loanResponse,
      closedDealOffer: loanResponse.closedDealOffer,
    });
  }

  for (const companyId of Object.keys(invoices)) {
    try {
      if (invoices[companyId].length === 0) {
        console.error('Encountered empty invoice');
        continue;
      }
      const lineItems = invoices[companyId].map((item) => {
        return {
          description: `ID: ${shortId(item.loanResponse.loanRequestId)}`,
          rate: item.commission,
          quantity: item.closedDealOffer.amount,
        };
      });
      console.log('companyId', companyId);
      console.log('line items', lineItems);

      const createdInvoice = await zohoClient.createInvoice({
        customer_id: invoices[companyId][0].zohoCustomerId,
        line_items: lineItems,
        payment_terms: 15,
      });

      //code 0 means success
      if (createdInvoice?.code === 0 && createdInvoice.invoice) {
        await zohoClient.submitForApproval(createdInvoice.invoice.invoice_id.toString());
        await prismaClient.$transaction(async (tx) => {
          const newInvoice = await tx.invoicesData.create({
            data: {
              sentAt: new Date(),
              zohoInvoiceData: { ...createdInvoice.invoice },
            },
          });
          await tx.loanResponse.updateMany({
            where: { id: { in: invoices[companyId].map((item) => item.loanResponse.id) } },
            data: { invoiceId: newInvoice.id },
          });
        });
      }
    } catch (e) {
      logger({
        error: new RoshiError(ERROR_KEYS.INTERNAL_ERROR, {
          message: 'Error while generating invoice',
          originalError: e,
        }),
        source: LogSource.CRON_JOB,
        level: LogLevel.ERROR,
        errorType: ERROR_KEYS.INTERNAL_ERROR,
      });
      continue;
    }
  }
};
