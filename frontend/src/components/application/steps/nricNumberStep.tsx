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
  const [cccd, setCccd] = useState<string>("");

  useEffect(() => {
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.nricNumber].validation(
        visitor?.stepData.find((step) => step.stepKey === ApplicationStepsEnum.nricNumber)?.data
      );
      setCccd(stepData);
    } catch (e) {
      // do nothing
    }
  }, [visitor?.stepData]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (!cccd) {
        setError(VALIDATION_MESSAGES.CCCD.REQUIRED);
        return;
      }
      return cccd;
    },
  }));

  return (
    <Flex y gap2 px={{ xs: 3, sm: 2, md: 0 }}>
      <ApplicationStyledInput
        data-testid={TEST_IDS.nricInput}
        value={cccd}
        placeholder="Nhập số CCCD"
        error={!!error}
        onChange={(e) => {
          // Only allow numbers and limit to 12 digits
          const value = e.target.value.replace(/\D/g, '').slice(0, 12);
          setCccd(value);
          setError("");
        }}
        sx={{ maxWidth: 400, mx: "auto" }}
      />
    </Flex>
  );
});

// Keep the old component name for backward compatibility
export const NricNumberStep = CccdNumberStep;
