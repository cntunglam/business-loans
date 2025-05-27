import { Button } from "@mui/joy";
import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum, OptionsSettings, residencyStatusesEnum, residencyStatusesLabels } from "@roshi/shared";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useVisitorContext } from "../../../context/visitorContext";
import { TEST_IDS } from "../../../utils/testUtils";
import { Flex } from "../../shared/flex";

export const ResidencyStatusStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { setError, visitor, currentStepData } = useVisitorContext();
  const [value, setValue] = useState<residencyStatusesEnum | undefined>();

  const settings = useMemo(() => currentStepData?.settings as OptionsSettings, [currentStepData]);

  useEffect(() => {
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.residencyStatus].validation(
        visitor?.stepData.find((step) => step.stepKey === ApplicationStepsEnum.residencyStatus)?.data
      );
      setValue(stepData);
    } catch (e) {
      // do nothing
    }
  }, [visitor?.stepData]);

  useImperativeHandle(ref, () => ({
    getValue: () => value,
  }));

  const handleClick = (option: string) => {
    setError("");
    setValue(option as residencyStatusesEnum);
  };

  return (
    <Flex y gap2 sx={{ mx: "auto", maxWidth: 400, width: "100%" }} data-testid={TEST_IDS.residencyStatusBox}>
      {settings.options.map((option) => (
        <Button
          key={option}
          variant="outlined"
          color={value === option ? "primary" : "neutral"}
          onClick={() => handleClick(option)}
          sx={{ color: value === option ? "primary.500" : "neutral.400", width: { sm: "400px", xs: "100%" } }}
          size="lg"
        >
          {residencyStatusesLabels[option as residencyStatusesEnum]}
        </Button>
      ))}
    </Flex>
  );
});
