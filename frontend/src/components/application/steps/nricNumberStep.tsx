import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum } from "@roshi/shared";
import { VALIDATION_MESSAGES } from "@roshi/shared/locales/vi/validation";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useVisitorContext } from "../../../context/visitorContext";
import { TEST_IDS } from "../../../utils/testUtils";
import { Flex } from "../../shared/flex";
import { ApplicationStyledInput } from "../styled/applicationStyledInput";

export const CccdNumberStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { error, setError, visitor } = useVisitorContext();
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (!visitor) return;
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.cccdNumber].validation(
        visitor[ApplicationStepsEnum.cccdNumber],
      );
      setValue(stepData);
    } catch (e) {
      // do nothing
    }
  }, [visitor]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (!value) {
        setError(VALIDATION_MESSAGES.CCCD.REQUIRED);
        return;
      }
      return value;
    },
  }));

  return (
    <Flex y gap2 px={{ xs: 3, sm: 2, md: 0 }}>
      <ApplicationStyledInput
        data-testid={TEST_IDS.nricInput}
        value={value}
        placeholder="Nhập số CCCD"
        error={!!error}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '').slice(0, 12);
          setValue(value);
          setError("");
        }}
        sx={{ maxWidth: 400, mx: "auto" }}
      />
    </Flex>
  );
});

// Keep the old component name for backward compatibility
export const NricNumberStep = CccdNumberStep;
