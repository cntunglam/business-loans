import { Option } from "@mui/joy";
import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum, loanPurposesEnum, loanPurposesLabels, OptionsSettings } from "@roshi/shared";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useVisitorContext } from "../../../context/visitorContext";
import { TEST_IDS } from "../../../utils/testUtils";
import { Flex } from "../../shared/flex";
import { ApplicationStyledInput } from "../styled/applicationStyledInput";
import { ApplicationStyledSelect } from "../styled/applicationStyledSelect";

export const BorrowPurposeStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { t } = useTranslation();
  const { error, setError, currentStepData, visitor } = useVisitorContext();

  const settings = useMemo(() => currentStepData?.settings as OptionsSettings, [currentStepData]);

  const [option, setOption] = useState<string | undefined>();
  const [otherValue, setOtherValue] = useState<string>();

  useEffect(() => {
    if (!visitor) return;
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.borrowPurpose].validation(
        visitor[ApplicationStepsEnum.borrowPurpose],
      );
      const isNotOtherValue = settings.options.includes(stepData);
      if (isNotOtherValue) setOption(stepData);
      else {
        setOption(loanPurposesEnum.OTHER);
        setOtherValue(stepData);
      }
    } catch (e) {
      // do nothing
    }
  }, [settings, visitor]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (!option) {
        setError("Please select a purpose");
      } else if (option === loanPurposesEnum.OTHER && !otherValue) {
        setError("Please specify a purpose");
      } else {
        return option === loanPurposesEnum.OTHER ? otherValue : option;
      }
    },
  }));

  return (
    <Flex y gap2 px={{ xs: 3, md: 0 }}>
      <ApplicationStyledSelect
        data-testid={TEST_IDS.borrowPurposeSelect}
        placeholder={t("form:applying.choose_one")}
        value={option}
        onChange={(_, val) => {
          setError("");
          setOption(val || undefined);
        }}
        sx={{ maxWidth: 400, mx: "auto" }}
      >
        {settings.options.map((option) => (
          <Option key={option} value={option}>
            {loanPurposesLabels[option as loanPurposesEnum]}
          </Option>
        ))}
      </ApplicationStyledSelect>
      {option === loanPurposesEnum.OTHER && (
        <ApplicationStyledInput
          error={!!error}
          onChange={(e) => {
            setError("");
            setOtherValue(e.target.value);
          }}
          value={otherValue}
          placeholder="Please specify"
        />
      )}
    </Flex>
  );
});
