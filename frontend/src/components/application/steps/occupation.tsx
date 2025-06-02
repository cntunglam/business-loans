import { Option } from "@mui/joy";
import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum, employmentTypeEnum, employmentTypeLabels, OptionsSettings } from "@roshi/shared";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useVisitorContext } from "../../../context/visitorContext";
import { TEST_IDS } from "../../../utils/testUtils";
import { Flex } from "../../shared/flex";
import { ApplicationStyledInput } from "../styled/applicationStyledInput";
import { ApplicationStyledSelect } from "../styled/applicationStyledSelect";

export const OccupationStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { setError, error, visitor, currentStepData } = useVisitorContext();
  const [option, setOption] = useState<string | undefined>();
  const [value, setValue] = useState<string>("");

  const settings = useMemo(() => currentStepData?.settings as OptionsSettings, [currentStepData]);

  useEffect(() => {
    if (!visitor) return;
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.employmentType].validation(
        visitor[ApplicationStepsEnum.employmentType],
      );
      if (stepData)
        if (Object.values(employmentTypeEnum).includes(stepData as employmentTypeEnum)) {
          setOption(stepData);
        } else {
          setOption(employmentTypeEnum.OTHER);
          setValue(stepData);
        }
    } catch (e) {
      // do nothing
    }
  }, [visitor]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (!option) {
        setError("Please select your career");
        return;
      }
      if (
        option === employmentTypeEnum.OTHER &&
        !value
      ) {
        setError("Please enter your job title");
        return;
      }
      return option === employmentTypeEnum.OTHER ? value : option;
    },
  }));

  return (
    <Flex y gap2 px={{ xs: 3, sm: 2, md: 0 }}>
      <ApplicationStyledSelect
        data-testid={TEST_IDS.employmentTypeSelect}
        placeholder="Choose one"
        value={option}
        onChange={(_, val) => {
          setError("");
          setOption(val || undefined);
        }}
      >
        {settings.options.map((option) => (
          <Option key={option} value={option}>
            {employmentTypeLabels[option as employmentTypeEnum]}
          </Option>
        ))}
      </ApplicationStyledSelect>
      {option === employmentTypeEnum.OTHER && (
        <ApplicationStyledInput
          error={error?.toLowerCase().includes("job title") || false}
          data-testid={TEST_IDS.jobTitleInput}
          onChange={(e) => {
            setError("");
            setValue(e.target.value);
          }}
          value={value}
          placeholder="Add your job title"
        />
      )}
    </Flex>
  );
});
