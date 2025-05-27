import { Prisma } from "@roshi/shared";

export const formatRejectionReason = (
  loanResponse?: Prisma.LoanResponseGetPayload<{ select: { comment: true; rejectionReasons: true } }>
) => {
  if (!loanResponse) return "-";
  return loanResponse.rejectionReasons && loanResponse.rejectionReasons.length > 0
    ? `${loanResponse.rejectionReasons.join(", ")} ${loanResponse.comment}`
    : loanResponse.comment || "-";
};
