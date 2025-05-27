import { formatInTimeZone, toDate } from 'date-fns-tz';

(async () => {
  const appointmentTime = '2025-01-04 15:00:00';
  const inUtc = toDate(appointmentTime, { timeZone: 'Asia/Singapore' });
  console.log({ inSg: formatInTimeZone(inUtc, 'Asia/Singapore', 'dd MMMM yyyy HH:mm') });
})();
