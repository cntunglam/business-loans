import { Checkbox, Link } from "@mui/joy";
import { SgManualFormSchema, UserRoleEnum } from "@roshi/shared";
import { format } from "date-fns-tz";
import { FC, useMemo } from "react";
import { useGetAllClosedLeads, useUpdateLoanResponseAdmin } from "../../api/useAdminApi";
import { useUserContext } from "../../context/userContext";
import { useModals } from "../../hooks/useModals";
import { OfferPreview } from "../lenderDashboard/offerPreview";
import { formatApplicationData } from "../shared/applicationDataFormatter";
import { CustomerSupportChip } from "../shared/customersupportChip";
import { ShortId } from "../shared/shortId";

interface Props {
  entry: NonNullable<ReturnType<typeof useGetAllClosedLeads>["query"]["data"]>[number];
  refetch: () => void;
}
export const ClosedLeadEntry: FC<Props> = ({ entry, refetch }) => {
  const updateLoanResponseAdmin = useUpdateLoanResponseAdmin();
  const { user } = useUserContext();
  const { renderModal, openModal } = useModals(entry.id, {
    closedDealOffer: (onClose) =>
      entry.closedDealOffer && (
        <OfferPreview onClose={onClose} lenderName={entry.lender.name} offer={entry.closedDealOffer} isClosedDeal />
      ),
  });

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    updateLoanResponseAdmin
      .mutateAsync({
        id: entry.id,
        supportData: { checklist: { ...(entry.supportData?.checklist || {}), [name]: checked } },
      })
      .then(() => {
        refetch();
      });
  };

  const applicantInfo = useMemo(
    () => SgManualFormSchema.safeParse(entry.loanRequest.applicantInfo?.data).data,
    [entry.loanRequest.applicantInfo]
  );

  return (
    <>
      {renderModal()}
      <tr>
        <td>{format(entry.closedDealOffer!.createdAt, "dd MMM HH:mm")}</td>
        <td>{format(entry.loanRequest.createdAt, "dd MMM HH:mm")}</td>
        <td>
          <Link color="neutral" onClick={() => openModal("closedDealOffer")}>
            {formatApplicationData({ property: "amount", value: entry.closedDealOffer?.amount })}{" "}
          </Link>
        </td>
        <td>
          <ShortId id={entry.loanRequest.id} />
        </td>
        <td>{applicantInfo?.fullname}</td>
        <td>{entry.lender.name}</td>
        <td>
          <CustomerSupportChip
            customerSupport={entry.loanRequest.customerSupport}
            loanRequestId={entry.loanRequest.id}
            callback={refetch}
          />
        </td>
        <td>{entry.loanRequest.privateNote}</td>
        <td style={{ textAlign: "center" }}>
          <Checkbox
            disabled={user?.role !== UserRoleEnum.ADMIN}
            label=""
            name="googleReviewChecked"
            checked={Boolean(entry.supportData?.checklist?.googleReviewChecked)}
            onChange={handleToggle}
          />
        </td>
        <td style={{ textAlign: "center" }}>
          <Checkbox
            disabled={user?.role !== UserRoleEnum.ADMIN}
            label=""
            name="cashbackChecked"
            checked={Boolean(entry.supportData?.checklist?.cashbackChecked)}
            onChange={handleToggle}
          />
        </td>
      </tr>
    </>
  );
};
