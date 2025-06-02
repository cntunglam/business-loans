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
    if (!visitor) return;
    try {
       const stepData = ApplicationSteps[ApplicationStepsEnum.borrowAmount].validation(
        visitor[ApplicationStepsEnum.borrowAmount],
        settings
      );
      setValue(stepData);
    } catch (error) {
      // do nothing
    }
  }, [settings, visitor]);

  useImperativeHandle(ref, () => ({
    getValue: () => value,
  }));

  return (
    <RsSlider
      step={100_000}
      suffix="₫"
      min={settings.min}
      max={settings.max}
      value={value}
      setValue={setValue}
      data-testid={TEST_IDS.borrowAmountSlider}
    />
  );
});

BorrowAmountStep.displayName = "BorrowAmountStep";
