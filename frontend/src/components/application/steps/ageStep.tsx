import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum, MinMaxSettings } from "@roshi/shared";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useVisitorContext } from "../../../context/visitorContext";
import { TEST_IDS } from "../../../utils/testUtils";
import { RsSlider } from "../../shared/rsSlider";

export const AgeStep = forwardRef((_, ref) => {
  const { currentStepData, visitor } = useVisitorContext();
  const settings = useMemo(() => currentStepData?.settings as MinMaxSettings, [currentStepData]);

  useEffect(() => {
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.age].validation(
        visitor?.stepData.find((step) => step.stepKey === ApplicationStepsEnum.age)?.data,
        settings
      );
      setValue(stepData);
    } catch (e) {
      // do nothing
    }
  }, [settings, visitor?.stepData]);

  const [value, setValue] = useState(settings.min);

  useImperativeHandle(ref, () => ({
    getValue: () => value,
  }));

  return (
    <RsSlider
      data-testid={TEST_IDS.borrowAgeSlider}
      step={1}
      suffix="years old"
      showSuffixOnValue={false}
      min={settings.min}
      max={settings.max}
      value={value}
      setValue={setValue}
    />
  );
});
