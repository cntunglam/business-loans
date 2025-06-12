import { StatusEnum } from '@roshi/shared';
import assert from 'node:assert';
import { describe, it } from 'node:test';
import { closeLoanOfferSchema } from '../loanOffer.controller';

describe('closeLoanOfferSchema', () => {
  it('should validate valid input', () => {
    const validInput = {
      id: '123',
      loanRequestId: '456',
      outcomeStatus: StatusEnum.APPROVED,
      outcomeComment: 'Approved',
      disbursementDate: '2023-01-01',
      closedDealOffer: {
        amount: 5000,
        term: 12,
        monthlyInterestRate: 0.01,
        fixedUpfrontFees: 100,
        variableUpfrontFees: 0.02,
      },
    };

    const result = closeLoanOfferSchema.safeParse(validInput);
    assert.strictEqual(result.success, true);
  });

  it('should validate valid rejection input', () => {
    const validRejection = {
      id: '123',
      outcomeStatus: StatusEnum.REJECTED,
      outcomeComment: 'Rejected',
      rejectionReasons: ['reason1', 'reason2'],
    };

    const result = closeLoanOfferSchema.safeParse(validRejection);
    assert.strictEqual(result.success, true);
  });

  it('should fail on invalid status', () => {
    const invalidInput = {
      id: '123',
      outcomeStatus: 'INVALID_STATUS',
    };

    const result = closeLoanOfferSchema.safeParse(invalidInput);
    assert.strictEqual(result.success, false);
  });

  it('should fail on invalid date format', () => {
    const invalidInput = {
      id: '123',
      outcomeStatus: StatusEnum.APPROVED,
      disbursementDate: 'invalid-date',
    };

    const result = closeLoanOfferSchema.safeParse(invalidInput);
    assert.strictEqual(result.success, false);
  });

  it('should fail on invalid offer amount', () => {
    const invalidInput = {
      outcomeStatus: StatusEnum.APPROVED,
      closedDealOffer: {
        amount: -1000,
        term: 12,
        monthlyInterestRate: 0.01,
        fixedUpfrontFees: 100,
        variableUpfrontFees: 0.02,
      },
    };

    const result = closeLoanOfferSchema.safeParse(invalidInput);
    assert.strictEqual(result.success, false);
  });
});
