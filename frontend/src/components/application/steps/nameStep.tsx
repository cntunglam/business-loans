import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum } from "@roshi/shared";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useVisitorContext } from "../../../context/visitorContext";
import { TEST_IDS } from "../../../utils/testUtils";
import { Flex } from "../../shared/flex";
import { ApplicationStyledInput } from "../styled/applicationStyledInput";

export const NameStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { error, setError, visitor } = useVisitorContext();
  const [name, setName] = useState<string>("");

  useEffect(() => {
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.fullName].validation(
        visitor?.stepData.find((step) => step.stepKey === ApplicationStepsEnum.fullName)?.data
      );
      setName(stepData);
    } catch (e) {
      // do nothing
    }
  }, [visitor?.stepData]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (!name) {
        setError("Please enter your full name");
        return;
      }
      return name;
    },
  }));

  return (
    <Flex y xc gap2 px={{ xs: 3, sm: 2, md: 0 }}>
      <ApplicationStyledInput
        value={name}
        data-testid={TEST_IDS.fullNameInput}
        placeholder="Add Full Name"
        error={!!error}
        sx={{ maxWidth: { xs: "100%", sm: 300, md: 300 } }}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
      />
    </Flex>
  );
});
