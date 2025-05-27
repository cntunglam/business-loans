import { Grid, Input, Typography } from "@mui/joy";
import { FC } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { NumericFormatAdapter } from "../shared/numericFormatAdapter";

interface LoanFormValues {
  amount: string;
  interestRate: string;
  term: string;
  upfrontFeePercentage?: string;
  upfrontFee?: string;
}

interface Props {
  amount: string;
  interestRate: string;
  term: string;
  upfrontFeePercentage: string;
  upfrontFee: string;
  register: UseFormRegister<LoanFormValues>;
  errors: FieldErrors<LoanFormValues>;
}

export const LoanOfferDetailsForm: FC<Props> = ({
  amount,
  interestRate,
  term,
  upfrontFeePercentage,
  upfrontFee,
  register,
  errors,
}) => {
  return (
    <>
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        <Grid xs={12} width={{ xs: "100%", md: "50%" }}>
          <Typography level="title-md" sx={{ color: "#999999" }}>
            Loan Amount
          </Typography>
          <Input
            {...register("amount")} // Register for validation
            sx={{ padding: "6px 10px" }}
            placeholder="Loan Amount"
            startDecorator={
              <Typography borderRight={"1px solid #DFDFDF"} padding={"7px 10px 7px 7px"}>
                $
              </Typography>
            }
            slotProps={{
              input: {
                component: NumericFormatAdapter,
              },
            }}
            value={amount}
          />
          {errors.amount && (
            <Typography color="danger" fontSize="sm" sx={{ marginTop: "5px" }}>
              {errors.amount.message}
            </Typography>
          )}
        </Grid>
        <Grid xs={12} width={{ xs: "100%", md: "50%" }}>
          <Typography level="title-md" sx={{ color: "#999999" }}>
            Monthly Interest Rate
          </Typography>
          <Input
            {...register("interestRate")}
            sx={{ padding: "6px 10px" }}
            startDecorator={
              <Typography borderRight={"1px solid #DFDFDF"} padding={"7px 10px 7px 7px"}>
                %
              </Typography>
            }
            slotProps={{
              input: {
                component: NumericFormatAdapter,
              },
            }}
            placeholder="Monthly interest rate"
            value={interestRate}
          />
          {errors.interestRate && (
            <Typography color="danger" fontSize="sm" sx={{ marginTop: "5px" }}>
              {errors.interestRate.message}
            </Typography>
          )}
        </Grid>
        <Grid xs={12} width={{ xs: "100%", md: "50%" }}>
          <Input
            {...register("term")}
            sx={{ padding: "6px 10px" }}
            startDecorator={
              <Typography borderRight={"1px solid #DFDFDF"} padding={"7px 10px 7px 7px"}>
                Months
              </Typography>
            }
            slotProps={{
              input: {
                component: NumericFormatAdapter,
              },
            }}
            placeholder="Loan duration"
            value={term}
          />

          {errors.term && (
            <Typography color="danger" fontSize="sm" sx={{ marginTop: "5px" }}>
              {errors.term.message}
            </Typography>
          )}
        </Grid>
        <Grid xs={12} width={"100%"}>
          <Typography level="title-md" sx={{ color: "#999999" }}>
            Upfront fees
          </Typography>
        </Grid>
        <Grid container spacing={2} sx={{ flexGrow: 1 }}>
          <Grid xs={12} md={6} width={{ xs: "100%", md: "50%" }}>
            <Input
              {...register("upfrontFeePercentage")}
              sx={{ padding: "6px 10px" }}
              startDecorator={
                <Typography borderRight={"1px solid #DFDFDF"} padding={"7px 10px 7px 7px"}>
                  %
                </Typography>
              }
              slotProps={{
                input: {
                  component: NumericFormatAdapter,
                },
              }}
              placeholder="Upfront percentage fee"
              value={upfrontFeePercentage}
            />

            {errors.upfrontFeePercentage && (
              <Typography color="danger" fontSize="sm" sx={{ marginTop: "5px" }}>
                {errors.upfrontFeePercentage.message}
              </Typography>
            )}
          </Grid>
          <Grid xs={12} md={6} width={{ xs: "100%", md: "50%" }}>
            <Input
              {...register("upfrontFee")}
              sx={{ padding: "6px 10px" }}
              startDecorator={
                <Typography borderRight={"1px solid #DFDFDF"} padding={"7px 10px 7px 7px"}>
                  $
                </Typography>
              }
              slotProps={{
                input: {
                  component: NumericFormatAdapter,
                },
              }}
              placeholder="Upfront fixed fee"
              value={upfrontFee}
            />
            {errors.upfrontFee && (
              <Typography color="danger" fontSize="sm" sx={{ marginTop: "5px" }}>
                {errors.upfrontFee.message}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
