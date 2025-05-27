import { Option } from "@mui/joy";
import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum, OptionsSettings, propertyOwnershipsEnum, propertyOwnershipsLabels } from "@roshi/shared";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useVisitorContext } from "../../../context/visitorContext";
import { TEST_IDS } from "../../../utils/testUtils";
import { Flex } from "../../shared/flex";
import { ApplicationStyledInput } from "../styled/applicationStyledInput";
import { ApplicationStyledSelect } from "../styled/applicationStyledSelect";

export const PropertyOwnershipStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { error, setError, visitor, currentStepData } = useVisitorContext();

  const settings = useMemo(() => currentStepData?.settings as OptionsSettings, [currentStepData]);

  const [propertyType, setPropertyType] = useState<propertyOwnershipsEnum | undefined>();
  const [postalCode, setPostalCode] = useState<string | undefined>();

  useEffect(() => {
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.propertyOwnership].validation(
        visitor?.stepData.find((step) => step.stepKey === ApplicationStepsEnum.propertyOwnership)?.data
      );
      setPostalCode(stepData.postalCode);
      setPropertyType(stepData.propertyOwnership);
    } catch (e) {
      // do nothing
    }
  }, [visitor?.stepData]);

  useImperativeHandle(ref, () => ({
    getValue: () => ({ propertyOwnership: propertyType || "", postalCode: postalCode || "" }),
  }));

  return (
    <Flex y gap1 px={{ xs: 3, sm: 2, md: 0 }}>
      <ApplicationStyledSelect
        data-testid={TEST_IDS.propertyOwnershipSelect}
        placeholder="Choose one"
        value={propertyType}
        onChange={(_, val) => {
          setError("");
          setPropertyType(val || undefined);
        }}
      >
        {settings.options.map((option) => (
          <Option key={option} value={option}>
            {propertyOwnershipsLabels[option as propertyOwnershipsEnum]}
          </Option>
        ))}
      </ApplicationStyledSelect>
      {propertyType && (
        <ApplicationStyledInput
          data-testid="postal-code-input"
          value={postalCode}
          error={error?.toLowerCase().includes("postal code")}
          onChange={(e) => {
            setError("");
            setPostalCode(e.target.value);
          }}
          placeholder="Add postal code"
        />
      )}
    </Flex>
  );
});
