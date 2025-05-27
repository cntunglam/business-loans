import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum, MinMaxSettings } from "@roshi/shared";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useVisitorContext } from "../../../context/visitorContext";
import { TEST_IDS } from "../../../utils/testUtils";
import { RsSlider } from "../../shared/rsSlider";

export const BorrowAmountStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { visitor, currentStepData } = useVisitorContext();

  const settings = useMemo(() => currentStepData?.settings as MinMaxSettings, [currentStepData]);

  const [value, setValue] = useState<number>(settings.min);

  useEffect(() => {
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.borrowAmount].validation(
        visitor?.stepData.find((step) => step.stepKey === ApplicationStepsEnum.borrowAmount)?.data,
        settings
      );
      setValue(stepData);
    } catch (e) {
      // do nothing
    }
  }, [settings, visitor?.stepData]);

  useImperativeHandle(ref, () => ({
    getValue: () => value,
  }));

  return (
    <RsSlider
      step={1000}
      prefix="$"
      min={settings.min}
      max={settings.max}
      value={value}
      setValue={setValue}
      data-testid={TEST_IDS.borrowAmountSlider}
    />
  );
});

BorrowAmountStep.displayName = "BorrowAmountStep";
