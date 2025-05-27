import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Checkbox, Option, Select, Textarea, Typography, type SelectOption } from "@mui/joy";
import { LoanResponseStatusEnum, StatusEnum } from "@roshi/shared";
import { FC, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { useCloseLoanOffer, useCreateLoanOffer } from "../../api/useLoanOfferApi";
import { RsModal } from "../shared/rsModal";

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  id: string;
  loanResponseId?: string;
  disableClickOutside?: boolean;
}

const RejectedFormSchema = z.object({
  reason: z.array(z.string()).min(1, "Please provide a reason for rejecting the loan"),
});

export const RejectLoanModal: FC<Props> = ({ onSuccess, onClose, id, loanResponseId, disableClickOutside }) => {
  const rejectApplication = useCreateLoanOffer();
  const closeLoanOffer = useCloseLoanOffer();
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [additionalNote, setAdditionalNote] = useState<string>("");

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm<z.infer<typeof RejectedFormSchema>>({
    resolver: zodResolver(RejectedFormSchema),
    defaultValues: {
      reason: ["Poor repayment record with moneylender"],
    },
  });

  const onSubmit = async (data: z.infer<typeof RejectedFormSchema>) => {
    if (!loanResponseId) {
      try {
        await rejectApplication.mutateAsync({
          loanRequestId: id,
          comment: additionalNote || "",
          status: LoanResponseStatusEnum.REJECTED,
          rejectionReasons: data.reason,
        });
        onClose();
        onSuccess?.();
        reset();
      } catch (error) {
        toast.error("Failed to reject offer");
      }
    } else {
      closeLoanOffer
        .mutateAsync({
          id: loanResponseId,
          outcomeStatus: StatusEnum.REJECTED,
          outcomeComment: additionalNote,
          rejectionReasons: data.reason,
        })
        .then(() => {
          onClose();
          onSuccess?.();
        });
    }
  };

  const reasons = useMemo(() => {
    if (loanResponseId) {
      return [
        { name: "Poor repayment record with moneylender", id: 1 },
        { name: "High debt with moneylender", id: 2 },
        { name: "High debt with banks", id: 3 },
        { name: "Litigation and/or Bankruptcy", id: 4 },
        { name: "Client not responding", id: 5 },
        { name: "Client withdrawed application", id: 6 },
        { name: "No show", id: 7 },
      ];
    } else
      return [
        { name: "Low income", id: 1 },
        { name: "Poor repayment record", id: 2 },
        { name: "High debt with moneylender", id: 3 },
        { name: "High debt with banks", id: 4 },
        { name: "No foreigner quota", id: 5 },
        { name: "Short employment", id: 6 },
        { name: "No proof of income", id: 7 },
        { name: "others", id: 8 },
      ];
  }, [loanResponseId]);

  const toggleReason = (reasonName: string[]) => {
    setSelectedReasons(reasonName);
    setValue("reason", reasonName.length > 0 ? reasonName : ["Poor repayment record with moneylender"], {
      shouldValidate: true,
    });
  };

  const renderValue = (selected: SelectOption<string>[]) => {
    if (!selected || selected.length === 0) {
      return "Select reasons";
    }
    return `${selected.length} reason${selected.length === 1 ? "" : "s"} selected`;
  };

  const sortedReasons = reasons.sort((a, b) => {
    const isASelected = selectedReasons.includes(a.name);
    const isBSelected = selectedReasons.includes(b.name);
    if (isASelected && !isBSelected) return -1; // A comes before B
    if (!isASelected && isBSelected) return 1; // B comes before A
    return 0; // If both are selected or neither, no change
  });

  return (
    <>
      <RsModal title="Reject Loan Offer" onClose={onClose} disableClickOutside={disableClickOutside}>
        <Typography level="title-md" sx={{ color: "#999999", marginBottom: "10px" }}>
          Reason for Rejection
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name={"reason"}
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select reasons"
                sx={{
                  padding: "12px 20px",
                  minWidth: 300,
                  marginBottom: "20px",
                  maxWidth: "830px",
                  width: "100%",
                }}
                multiple
                renderValue={renderValue}
                value={selectedReasons}
                onChange={(_, value) => toggleReason(value)}
              >
                {sortedReasons.map((reason) => (
                  <Option key={reason.id} value={reason.name}>
                    <Checkbox
                      checked={selectedReasons.includes(reason.name)} // Sync with state
                      label={reason.name}
                    />
                  </Option>
                ))}
              </Select>
            )}
          />

          {errors.reason && (
            <Typography color="danger" fontSize="sm" sx={{ marginBottom: "10px" }}>
              {errors.reason.message}
            </Typography>
          )}

          <Typography level="title-md" sx={{ color: "#999999", marginBottom: "10px" }}>
            Additional Note (if any)
          </Typography>
          <Textarea
            placeholder="Enter any additional details here..."
            minRows={4}
            size="md"
            value={additionalNote}
            onChange={(e) => setAdditionalNote(e.target.value)}
            sx={{ marginBottom: "20px" }}
          />

          <Button sx={{ padding: "10px 25px", fontSize: "16px" }} loading={rejectApplication.isPending} type="submit">
            Confirm Rejection
          </Button>
        </form>
      </RsModal>
    </>
  );
};
