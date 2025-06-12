import { ApplicationSteps } from '@roshi/backend/services/applicationSteps.service';
import { ApplicationStepsEnum, MinMaxSettings } from '@roshi/shared';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useVisitorContext } from '../../../context/visitorContext';
import { TEST_IDS } from '../../../utils/testUtils';
import { Flex } from '../../shared/flex';
import { RsSlider } from '../../shared/rsSlider';

export const IncomeStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { setError, visitor, currentStepData } = useVisitorContext();
  const settings = useMemo(() => currentStepData?.settings as MinMaxSettings, [currentStepData]);
  const [value, setValue] = useState<number>(settings.min);

  useEffect(() => {
    if (!visitor) return;
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.monthlyIncome].validation(
        visitor[ApplicationStepsEnum.monthlyIncome],
        settings
      );
      setValue(stepData);
    } catch (e) {
      // do nothing
    }
  }, [visitor, settings]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (!value) {
        setError('Please enter your monthly income');
        return;
      }
      return value;
    }
  }));
  return (
    <Flex y px={{ xs: 3, sm: 2, md: 0 }}>
      <RsSlider
        step={100_000}
        suffix={'₫' + (value === settings.max ? '+' : '')}
        min={settings.min}
        max={settings.max}
        value={value}
        setValue={setValue}
        data-testid={TEST_IDS.monthlyIncomeInput}
      />
    </Flex>
  );
});
