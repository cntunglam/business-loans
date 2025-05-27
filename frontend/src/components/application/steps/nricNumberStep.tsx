import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum } from "@roshi/shared";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useVisitorContext } from "../../../context/visitorContext";
import { TEST_IDS } from "../../../utils/testUtils";
import { Flex } from "../../shared/flex";
import { ApplicationStyledInput } from "../styled/applicationStyledInput";

export const NricNumberStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { error, setError, visitor } = useVisitorContext();
  const [nric, setNric] = useState<string>("");

  useEffect(() => {
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.nricNumber].validation(
        visitor?.stepData.find((step) => step.stepKey === ApplicationStepsEnum.nricNumber)?.data
      );
      setNric(stepData);
    } catch (e) {
      // do nothing
    }
  }, [visitor?.stepData]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (!nric) {
        setError("Please enter your NRIC number");
        return;
      }
      return nric;
    },
  }));

  return (
    <Flex y gap2 px={{ xs: 3, sm: 2, md: 0 }}>
      <ApplicationStyledInput
        data-testid={TEST_IDS.nricInput}
        value={nric}
        placeholder="Add your NRIC"
        error={!!error}
        onChange={(e) => {
          setNric(e.target.value);
          setError("");
        }}
        sx={{ maxWidth: 400, mx: "auto" }}
      />
    </Flex>
  );
});
