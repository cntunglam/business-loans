import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum } from "@roshi/shared";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useVisitorContext } from "../../../context/visitorContext";
import { TEST_IDS } from "../../../utils/testUtils";
import { Flex } from "../../shared/flex";
import { ApplicationStyledInput } from "../styled/applicationStyledInput";

export const AddressStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { error, setError, visitor } = useVisitorContext();
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (!visitor) return;
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.streetAddress].validation(
        visitor[ApplicationStepsEnum.streetAddress],
      );
      setValue(stepData);
    } catch (error) {
      // do nothing
    }
  }, [visitor]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (!value) {
        setError("Please enter your city");
        return;
      }
      return value;
    },
  }));

  return (
    <Flex y xc gap2 px={{ xs: 3, sm: 2, md: 0 }}>
      <ApplicationStyledInput
        value={value}
        data-testid={TEST_IDS.fullNameInput}
        placeholder="Địa chỉ chi tiết"
        error={!!error}
        sx={{ maxWidth: { xs: "100%", sm: 300, md: 300 } }}
        onChange={(e) => {
          setValue(e.target.value);
          setError("");
        }}
      />
    </Flex>
  );
});
