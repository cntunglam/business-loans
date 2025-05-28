import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum, MinMaxSettings } from "@roshi/shared";
import { addYears } from 'date-fns';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useVisitorContext } from "../../../context/visitorContext";
import { RsDatePicker } from '../../shared/rsDatePicker';

export const AgeStep = forwardRef((_, ref) => {
  const { currentStepData, visitor } = useVisitorContext();
  const settings = useMemo(() => currentStepData?.settings as MinMaxSettings, [currentStepData]);
  const [value, setValue] = useState<Date | null>(null);

  useEffect(() => {
    if (!visitor) return;
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.dateOfBirth].validation(
        visitor[ApplicationStepsEnum.dateOfBirth],
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
    <RsDatePicker
      isTimeSelected={"date"}
      open
      selected={value}
      onChange={(date: Date | null) => setValue(date)}
      calendarStartDay={1}
      minDate={addYears(new Date(), -settings.max)}
      maxDate={addYears(new Date(), -settings.min)}
      showYearDropdown
      yearDropdownItemNumber={settings.max}
    />
  );
});
