import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Grid, Input, Option, Select, Typography } from "@mui/joy";
import {
  CompanyStatusEnum,
  CompanyTypeEnum,
  CountriesEnum,
  LenderSettingsKeys,
  LoanResponseStatusEnum,
  OfferPreferenceSettingsSchema,
  StatusEnum,
  calculateEMI,
  type Prisma,
} from "@roshi/shared";
import { FC, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useGetCompanies } from "../../api/useAdminApi";
import { useGetOfferPreferenceSettings } from "../../api/useCompanyApi";
import { useCloseLoanOffer, useCreateLoanOffer } from "../../api/useLoanOfferApi";
import { formatToDisplayString } from "../../utils/utils";
import { RsModal } from "../shared/rsModal";
import { LoanOfferDetailsForm } from "./loanOfferDetailsForm";

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  isAdmin?: boolean;
  id: string;
  loanResponse?: Prisma.LoanResponseGetPayload<{ select: { id: true; loanOffer: true } }>;
  disableClickOutside?: boolean;
}

export const LoanFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Loan amount is required")
    .refine((value) => parseFloat(value?.replaceAll?.(",", "")) >= 100, {
      message: "Amount must be greater or equal to 100",
    }),
  interestRate: z
    .string()
    .min(1, "Interest rate is required")
    .refine(
      (value) => {
        const rate = parseFloat(value);
        return rate >= 0;
      },
      { message: "Interest rate must be grater than 0" }
    ),
  term: z
    .string()
    .min(1, "Loan duration is required")
    .refine((value) => Number.isInteger(parseFloat(value)) && parseInt(value) > 0, {
      message: "Duration must be a positive integer",
    }),
  upfrontFeePercentage: z
    .string()
    .optional()
    .refine((value) => !value || (parseFloat(value) >= 0 && parseFloat(value) <= 100), {
      message: "Percentage fee must be between 0 and 100",
    }),
  upfrontFee: z
    .string()
    .optional()
    .refine((value) => !value || parseFloat(value) >= 0, {
      message: "Fixed fee must be greater than or equal to zero",
    }),
  disbursementDate: z
    .string()
    .refine((value) => !value || !isNaN(Date.parse(value)), {
      message: "Must be a valid date string",
    })
    .optional(),
});

export const ApproveLoanModal: FC<Props> = ({ onSuccess, onClose, id, isAdmin, loanResponse, disableClickOutside }) => {
  const isClosing = !!loanResponse;
  const approveApplication = useCreateLoanOffer();
  const closeLoanOffer = useCloseLoanOffer();

  const { data: companies } = useGetCompanies(
    {
      filters: { country: CountriesEnum.SG, type: CompanyTypeEnum.MONEYLENDER, status: CompanyStatusEnum.ACTIVE },
    },
    { enabled: isAdmin || false }
  );
  const { data: offerPreferenceSettings, isFetchedAfterMount } = useGetOfferPreferenceSettings({
    key: LenderSettingsKeys.DEFAULT_OFFER_VALUES,
  });

  const [companyId, setCompanyId] = useState<string>();
  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue,
    watch,
  } = useForm<z.infer<typeof LoanFormSchema>>({
    resolver: zodResolver(LoanFormSchema),
    defaultValues: {
      amount: loanResponse?.loanOffer?.amount?.toString() || "",
      interestRate: loanResponse?.loanOffer?.monthlyInterestRate?.toString() || "",
      term: loanResponse?.loanOffer?.term?.toString() || "",
      upfrontFeePercentage: loanResponse?.loanOffer?.variableUpfrontFees?.toString() || "",
      upfrontFee: loanResponse?.loanOffer?.fixedUpfrontFees?.toString() || "",
    },
  });

  const amount = watch("amount")?.replaceAll(",", "");
  const term = watch("term");
  const interestRate = watch("interestRate");
  const upfrontFeePercentage = watch("upfrontFeePercentage");
  const upfrontFee = watch("upfrontFee");

  const upfrontFeesTotal = useMemo(
    () => Number(upfrontFee) + (Number(amount) * Number(upfrontFeePercentage)) / 100,
    [amount, upfrontFee, upfrontFeePercentage]
  );

  useEffect(() => {
    if (isFetchedAfterMount && offerPreferenceSettings && typeof offerPreferenceSettings?.value === "object") {
      const preferences = OfferPreferenceSettingsSchema.parse(offerPreferenceSettings).value;
      setValue("interestRate", preferences.interestRate?.toString() || "");
      setValue("upfrontFeePercentage", preferences.variableAdminFee?.toString() || "");
      setValue("upfrontFee", preferences.fixedAdminFee?.toString() || "");
    }
  }, [isFetchedAfterMount, offerPreferenceSettings]);

  const onSubmit = async (data: z.infer<typeof LoanFormSchema>) => {
    if (!isClosing) {
      try {
        await approveApplication.mutateAsync({
          loanRequestId: id,
          status: LoanResponseStatusEnum.ACCEPTED,
          companyId: companyId,
          offer: {
            amount: parseInt(data.amount?.replaceAll(",", "")),
            term: parseInt(data.term),
            monthlyInterestRate: parseFloat(data.interestRate),
            fixedUpfrontFees: Number(data.upfrontFee || 0),
            variableUpfrontFees: Number(data.upfrontFeePercentage || 0),
          },
        });
        onClose();
        onSuccess?.();
      } catch (error) {
        console.log(error);
      }
    } else {
      closeLoanOffer
        .mutateAsync({
          id: loanResponse!.id,
          outcomeStatus: StatusEnum.APPROVED as StatusEnum,
          outcomeComment: "",
          closedDealOffer: {
            amount: parseInt(data.amount?.replaceAll(",", "")),
            term: parseInt(data.term),
            monthlyInterestRate: parseFloat(interestRate),
            fixedUpfrontFees: Number(upfrontFee || 0),
            variableUpfrontFees: Number(upfrontFeePercentage || 0),
          },
          disbursementDate: new Date(data.disbursementDate || new Date()) || new Date(),
        })
        .then(() => {
          onClose();
          onSuccess?.();
        });
    }
  };

  return (
    <RsModal
      title={isClosing ? "Approve loan offer" : "Give loan offer"}
      onClose={onClose}
      padding="sm"
      disableClickOutside={disableClickOutside}
    >
      {isAdmin && (
        <Select placeholder="Select company" value={companyId} onChange={(_, val) => setCompanyId(val || undefined)}>
          {companies?.map((company) => (
            <Option key={company.id} value={company.id}>
              {company.name}
            </Option>
          ))}
        </Select>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <LoanOfferDetailsForm
          register={register}
          errors={errors}
          amount={amount}
          interestRate={interestRate}
          term={term}
          upfrontFeePercentage={upfrontFeePercentage as string}
          upfrontFee={upfrontFee as string}
        />
        {isClosing && (
          <Grid container spacing={2}>
            <Grid xs={12} width={{ xs: "100%", md: "50%" }}>
              <Typography level="title-md" sx={{ color: "#999999" }}>
                Disbursement Date
              </Typography>
              <Input
                {...register("disbursementDate")}
                sx={{ padding: "6px 10px" }}
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </Grid>
          </Grid>
        )}

        <Card
          variant="soft"
          sx={{
            my: 2,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            backgroundColor: (theme) => theme.palette.background.level2,
          }}
        >
          <Typography>
            <b>Total:</b> {formatToDisplayString(upfrontFeesTotal)}$
          </Typography>
          <Typography>
            <b>Monthly instalment:</b>{" "}
            {formatToDisplayString(calculateEMI(Number(amount), Number(interestRate) / 100, Number(term)), 2)}$
          </Typography>
        </Card>
        <Button
          fullWidth
          sx={{ padding: "10px 20px", fontSize: "16px", fontWeight: "bolder", lineHeight: "24px" }}
          loading={approveApplication.isPending || closeLoanOffer.isPending}
          type="submit"
        >
          Submit
        </Button>
      </form>
    </RsModal>
  );
};
