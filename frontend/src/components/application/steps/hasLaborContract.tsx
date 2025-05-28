import { Button } from "@mui/joy";
import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum } from "@roshi/shared";
import { isBoolean } from 'lodash';
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useVisitorContext } from "../../../context/visitorContext";
import { TEST_IDS } from "../../../utils/testUtils";
import { Flex } from "../../shared/flex";

const options = ["Yes", "No"];

export const HasLaborContractStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { visitor } = useVisitorContext();
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    if (!visitor) return;
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.hasLaborContract].validation(
        visitor[ApplicationStepsEnum.hasLaborContract],
      );
      if (isBoolean(stepData)) {
        setValue(stepData ? "YES" : "NO");
      }
    } catch (e) {
      // do nothing
    }
  }, [visitor]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return value === "Yes";
    },
  }));

  return (
    <Flex y gap={4}>
      <Flex y gap2 px={{ xs: 3, sm: 2, md: 0 }} data-testid={TEST_IDS.existingLoanBox}>
        {options.map((option) => (
          <Button
            key={option}
            variant="outlined"
            color={value === option ? "primary" : "neutral"}
            onClick={() => {
              setValue(option);
            }}
            sx={{
              color: value === option ? "primary.500" : "neutral.400",
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

    </Flex>
  );
});
