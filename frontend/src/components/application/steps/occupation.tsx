import { Option } from "@mui/joy";
import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum, employmentStatusesEnum, employmentStatusesLabels, OptionsSettings } from "@roshi/shared";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useVisitorContext } from "../../../context/visitorContext";
import { Flex } from "../../shared/flex";
import { ApplicationStyledInput } from "../styled/applicationStyledInput";
import { ApplicationStyledSelect } from "../styled/applicationStyledSelect";

export const OccupationStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { setError, error, visitor, currentStepData } = useVisitorContext();
  const [option, setOption] = useState<employmentStatusesEnum | undefined>();
  const [employment, setEmployment] = useState<string>("");

  const settings = useMemo(() => currentStepData?.settings as OptionsSettings, [currentStepData]);

  useEffect(() => {
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.occupation].validation(
        visitor?.stepData.find((step) => step.stepKey === ApplicationStepsEnum.occupation)?.data
      ) as { employmentStatus: employmentStatusesEnum; jobTitle?: string };
      setOption(stepData.employmentStatus);
      setEmployment(stepData.jobTitle || "");
    } catch (e) {
      // do nothing
    }
  }, [visitor?.stepData]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (!option) {
        setError("Please select your occupation");
        return;
      }
      if (
        (option === employmentStatusesEnum.EMPLOYED || option === employmentStatusesEnum.SELF_EMPLOYED) &&
        !employment
      ) {
        setError("Please enter your job title");
        return;
      }
      return {
        employmentStatus: option,
        jobTitle: employment || undefined,
      };
    },
  }));

  return (
    <Flex y gap2 px={{ xs: 3, sm: 2, md: 0 }}>
      <ApplicationStyledSelect
        data-testid="occupational-status-select"
        placeholder="Choose one"
        value={option}
        onChange={(_, val) => {
          setError("");
          setOption(val || undefined);
        }}
      >
        {settings.options.map((option) => (
          <Option key={option} value={option}>
            {employmentStatusesLabels[option as employmentStatusesEnum]}
          </Option>
        ))}
      </ApplicationStyledSelect>
      {(option === employmentStatusesEnum.EMPLOYED || option === employmentStatusesEnum.SELF_EMPLOYED) && (
        <ApplicationStyledInput
          error={error?.toLowerCase().includes("job title") || false}
          data-testid="job-title-input"
          onChange={(e) => {
            setError("");
            setEmployment(e.target.value);
          }}
          value={employment}
          placeholder="Add your job title"
        />
      )}
    </Flex>
  );
});
