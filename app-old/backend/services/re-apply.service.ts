import { JobsEnum, LoanResponseStatusEnum, SgManualFormSchema, StatusEnum } from '@roshi/shared';
import {
  differenceInSeconds,
  endOfMonth,
  getDate,
  getHours,
  getMinutes,
  getSeconds,
  isLastDayOfMonth,
  set,
  startOfMonth,
} from 'date-fns';
import { toDate, toZonedTime } from 'date-fns-tz';
import { prismaClient } from '../clients/prismaClient';
import { CONFIG } from '../config';
import { createJob } from '../jobs/boss';
import { isForeigner } from '../utils/roshiUtils';

export const computeReapplyLoanRequests = async (day = new Date()) => {
  // Convert input day to SGT for all calculations
  const localDay = toZonedTime(day, CONFIG.TIMEZONE);
  const currentDayOfMonth = getDate(localDay);

  // Calculate the start of the current month in SGT
  const localStartOfCurrentMonth = startOfMonth(localDay);
  // Convert back to UTC for database query
  const startOfCurrentMonth = toDate(localStartOfCurrentMonth);

  // Check if today is the last day of the month in SGT
  const isLastDay = isLastDayOfMonth(localDay);

  const allPotentialUsers = await prismaClient.user.findMany({
    where: {
      AND: [
        {
          OR: [
            // Has at least one ACTIVE loan request
            { loanRequests: { some: { status: 'ACTIVE' } } },
            // OR has closed at least one loan
            {
              loanRequests: {
                some: {
                  loanResponses: {
                    some: { outcomeStatus: StatusEnum.APPROVED },
                  },
                },
              },
            },
          ],
        },
        // Has at least one loan response with an offer
        {
          loanRequests: {
            some: {
              loanResponses: {
                some: {
                  status: LoanResponseStatusEnum.ACCEPTED,
                },
              },
            },
          },
        },
        // Has made an appointment
        {
          loanRequests: {
            some: {
              loanResponses: {
                some: {
                  appointment: { isNot: null },
                },
              },
            },
          },
        },
        // Exclude loan requests from the current month
        {
          loanRequests: {
            none: {
              OR: [
                {
                  createdAt: {
                    gte: startOfCurrentMonth,
                  },
                },
                {
                  isAutoReapply: true,
                },
              ],
            },
          },
        },
      ],
    },
    include: {
      userSettings: true,
      loanRequests: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          applicantInfo: true,
          loanResponses: {
            include: {
              loanOffer: true,
              appointment: true,
            },
          },
        },
      },
    },
  });

  // Get the maximum day number for the current month in SGT
  const sgtEndOfMonth = endOfMonth(localDay);
  const lastDayOfCurrentMonth = getDate(sgtEndOfMonth);

  // Filter users whose latest loan request was on the same day of month as today
  // or on a day that doesn't exist in the current month but would correspond to today
  const potentialUsers = allPotentialUsers.filter((user) => {
    if (user.loanRequests.length === 0) return false;

    const latestRequest = user.loanRequests[0];

    // Convert UTC timestamp from DB to SGT for comparison
    const requestDateInLocalTime = toZonedTime(new Date(latestRequest.createdAt), CONFIG.TIMEZONE);
    const requestDayOfMonth = getDate(requestDateInLocalTime);

    // Exact match for the day of month
    if (requestDayOfMonth === currentDayOfMonth) return true;

    // Handle edge case: if today is the last day of month and the request was on a day
    // that doesn't exist in the current month (e.g., 31st when current month has 30 days max)
    if (isLastDay && requestDayOfMonth > lastDayOfCurrentMonth) {
      return true;
    }

    return false;
  });

  const eligibleUsers = potentialUsers.filter((user) => {
    if (user.userSettings?.autoReapplyDisabled) return false;
    for (const request of user.loanRequests) {
      const applicantInfo = SgManualFormSchema.safeParse(request.applicantInfo);
      if (applicantInfo.success && applicantInfo.data.monthlyIncome <= 1250) return false;
      if (applicantInfo.data && isForeigner(applicantInfo.data) && applicantInfo.data.monthlyIncome < 2500)
        return false;
    }
    return true;
  });

  console.log(`Eligible users for reapply: ${eligibleUsers.length}`);

  for (const user of eligibleUsers) {
    // Get the most recent loan request
    const latestRequest = user.loanRequests[0];

    // Convert the createdAt time to SGT
    const createdAtLocal = toZonedTime(latestRequest.createdAt, CONFIG.TIMEZONE);

    // Create a date for today with the same hours/minutes/seconds as the original request in SGT
    const targetTimeLocal = set(localDay, {
      hours: getHours(createdAtLocal),
      minutes: getMinutes(createdAtLocal),
      seconds: getSeconds(createdAtLocal),
    });

    // Convert the target time back to UTC for scheduling
    const targetTimeUTC = toDate(targetTimeLocal);

    // Calculate seconds to wait (0 if target time has already passed today)
    const delayInSeconds = Math.max(0, differenceInSeconds(targetTimeUTC, day));

    createJob(JobsEnum.REAPPLY_LOAN_REQUEST, { userId: user.id }, { startAfter: delayInSeconds });
  }
};
