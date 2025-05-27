import { InfoOutlined } from "@mui/icons-material";
import { Button, Typography } from "@mui/joy";
import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum } from "@roshi/shared";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useVisitorContext } from "../../../context/visitorContext";
import { TEST_IDS } from "../../../utils/testUtils";
import { Flex } from "../../shared/flex";
import { NumericFormatAdapter } from "../../shared/numericFormatAdapter";
import { RsTooltip } from "../../shared/rsTooltip";
import { ApplicationStyledInput } from "../styled/applicationStyledInput";

const options = ["Yes", "No"];

export const ExistingLoansStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { error, setError, visitor } = useVisitorContext();
  const [hasLoan, setHasLoan] = useState<string>();
  const [bankDebt, setBankDebt] = useState<string>("");
  const [lenderDebt, setLenderDebt] = useState<string>("");

  useEffect(() => {
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.existingLoans].validation(
        visitor?.stepData.find((step) => step.stepKey === ApplicationStepsEnum.existingLoans)?.data
      );
      if (stepData && stepData.bankDebt === 0 && stepData.lenderDebt === 0) {
        setHasLoan("No");
        return;
      }
      if (stepData.bankDebt || stepData.lenderDebt) setHasLoan("Yes");
      setBankDebt(stepData.bankDebt.toString());
      setLenderDebt(stepData.lenderDebt.toString());
    } catch (e) {
      // do nothing
    }
  }, [visitor?.stepData]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (hasLoan === "Yes" && !bankDebt && !lenderDebt) {
        setError("If you have an existing loan, please provide the amount");
      } else {
        return {
          bankDebt: hasLoan === "No" ? 0 : bankDebt ? parseInt(bankDebt) : 0,
          lenderDebt: hasLoan === "No" ? 0 : lenderDebt ? parseInt(lenderDebt) : 0,
        };
      }
    },
  }));

  return (
    <Flex y gap={4}>
      <Flex y gap2 px={{ xs: 3, sm: 2, md: 0 }} data-testid={TEST_IDS.existingLoanBox}>
        {options.map((option) => (
          <Button
            key={option}
            variant="outlined"
            color={hasLoan === option ? "primary" : "neutral"}
            onClick={() => {
              setError("");
              setHasLoan(option);
            }}
            sx={{
              color: hasLoan === option ? "primary.500" : "neutral.400",
              minWidth: { xs: "200px", md: "400px" },
              outline: "none !important",
              flexGrow: 1,
            }}
            size="lg"
          >
            {option}
          </Button>
        ))}
      </Flex>
      {hasLoan === "Yes" && (
        <Flex y gap1 px={{ xs: 3, sm: 2, md: 0 }}>
          <Flex x gap1 yc xc>
            <Typography level="title-md" textAlign="center">
              Unsecured debt with banks{" "}
            </Typography>
            <RsTooltip
              title="Unsecured debt doesn't include home loans, auto loans. Examples of unsecured debt include credit card debt, student loans, and personal loans."
              sx={{ maxWidth: "300px" }}
            >
              <InfoOutlined color="primary" />
            </RsTooltip>
          </Flex>
          <ApplicationStyledInput
            error={!!error}
            className="income-input"
            startDecorator={<Typography level="h4">$</Typography>}
            slotProps={{
              input: {
                component: NumericFormatAdapter,
              },
            }}
            value={bankDebt}
            onChange={(e) => {
              setError("");
              setBankDebt(e.target.value);
            }}
            color="secondary"
          />

          <Typography level="title-md" textAlign="center" sx={{ mt: 4 }}>
            Unsecured debt with moneylenders
          </Typography>
          <ApplicationStyledInput
            error={!!error}
            className="income-input"
            startDecorator={<Typography level="h4">$</Typography>}
            value={lenderDebt}
            slotProps={{
              input: {
                component: NumericFormatAdapter,
              },
            }}
            onChange={(e) => {
              setError("");
              setLenderDebt(e.target.value);
            }}
            color="secondary"
          />
        </Flex>
      )}
    </Flex>
  );
});
