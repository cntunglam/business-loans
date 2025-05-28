import { FormControl, Typography } from "@mui/joy";
import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum } from "@roshi/shared";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useVisitorContext } from "../../../context/visitorContext";
import { TEST_IDS } from "../../../utils/testUtils";
import { Flex } from "../../shared/flex";
import { NumericFormatAdapter } from "../../shared/numericFormatAdapter";
import { ApplicationStyledInput } from "../styled/applicationStyledInput";

export const IncomeStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { error, setError, visitor } = useVisitorContext();
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (!visitor) return;
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.monthlyIncome].validation(
        visitor[ApplicationStepsEnum.monthlyIncome],
      );
      if (stepData) {
        setValue(`${stepData}`);
      }
    } catch (e) {
      // do nothing
    }
  }, [visitor]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (!value) {
        setError("Please enter your monthly income");
        return;
      }
      return parseInt(value);
    },
  }));
  return (
    <Flex y px={{ xs: 3, sm: 2, md: 0 }}>
      <FormControl>
        <ApplicationStyledInput
          data-testid={TEST_IDS.monthlyIncomeInput}
          size="lg"
          placeholder="Thu nhập"
          startDecorator={
            <Typography level="h4" color="secondary">
              VND
            </Typography>
          }
          error={!!error}
          value={value}
          className="income-input"
          slotProps={{
            input: {
              component: NumericFormatAdapter,
            },
          }}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          color="secondary"
        />
      </FormControl>
    </Flex>
  );
});
