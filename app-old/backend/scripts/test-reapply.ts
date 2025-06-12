import { addDays } from 'date-fns';
import { computeReapplyLoanRequests } from '../services/re-apply.service';

(async () => {
  await computeReapplyLoanRequests(addDays(new Date(), 1));
})();
