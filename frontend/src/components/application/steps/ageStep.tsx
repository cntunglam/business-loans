import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum } from "@roshi/shared";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useVisitorContext } from "../../../context/visitorContext";
import { RsDatePicker } from '../../shared/rsDatePicker';

export const AgeStep = forwardRef((_, ref) => {
  const { visitor } = useVisitorContext();
  const [value, setValue] = useState<Date | null>(null);

  useEffect(() => {
    if (!visitor) return;
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.dateOfBirth].validation(
        visitor[ApplicationStepsEnum.dateOfBirth],
      );
      setValue(stepData);
    } catch (e) {
      // do nothing
      setValue(new Date());
    }
  }, [visitor]);

  useImperativeHandle(ref, () => ({
    getValue: () => value,
  }));

  if (!value) {
    return null
  }

  return (
    <RsDatePicker
      isTimeSelected={"date"}
      open
      selected={value}
      onChange={(date: Date | null) => setValue(date)}
      calendarStartDay={1}
      maxDate={new Date()}
      showYearDropdown
    />
  );
});
