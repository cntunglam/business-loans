import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum, MinMaxSettings } from "@roshi/shared";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useVisitorContext } from "../../../context/visitorContext";
import { TEST_IDS } from '../../../utils/testUtils';
import { RsSlider } from "../../shared/rsSlider";

export const BorrowTermStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { t } = useTranslation();
  const { visitor, currentStepData } = useVisitorContext();
  const settings = useMemo(() => currentStepData?.settings as MinMaxSettings, [currentStepData]);
  const [value, setValue] = useState<number>(settings.min);
  useEffect(() => {
    if (!visitor) return;
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.borrowPeriod].validation(
        visitor[ApplicationStepsEnum.borrowPeriod],
        settings
      );
      setValue(stepData);
    } catch (e) {
      // do nothing
    }
  }, [settings, visitor]);

  useImperativeHandle(ref, () => ({
    getValue: () => value,
  }));

  return (
    <RsSlider
      data-testid={TEST_IDS.borrowTermSlider}
      step={1}
      suffix={t("month")}
      min={settings.min}
      max={settings.max}
      value={value}
      setValue={setValue}
    />
  );
});

BorrowTermStep.displayName = "BorrowTermStep";
