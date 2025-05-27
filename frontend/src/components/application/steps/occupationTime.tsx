import { Option, Typography } from "@mui/joy";
import { ApplicationSteps } from "@roshi/backend/services/applicationSteps.service";
import { ApplicationStepsEnum, EmploymentTimeEnum, employmentTimeLabels } from "@roshi/shared";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useVisitorContext } from "../../../context/visitorContext";
import { TEST_IDS } from "../../../utils/testUtils";
import { Flex } from "../../shared/flex";
import { ApplicationStyledSelect } from "../styled/applicationStyledSelect";

export const OccupationTime = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { setError, visitor } = useVisitorContext();
  const [currEmployment, setCurrEmployment] = useState<EmploymentTimeEnum>(EmploymentTimeEnum.NA);
  const [prevEmployment, setPrevEmployment] = useState<EmploymentTimeEnum>(EmploymentTimeEnum.NA);

  useEffect(() => {
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.occupationTime].validation(
        visitor?.stepData.find((step) => step.stepKey === ApplicationStepsEnum.occupationTime)?.data
      );
      setCurrEmployment(stepData.currentEmploymentTime);
      setPrevEmployment(stepData.previousEmploymentTime);
    } catch (e) {
      // do nothing
    }
  }, [visitor?.stepData]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return {
        currentEmploymentTime: currEmployment,
        previousEmploymentTime: prevEmployment,
      };
    },
  }));

  return (
    <Flex y xc gap={4} sx={{ fontSize: "30px", color: "neutral.400" }}>
      <Flex y xc gap1 fullwidth px={{ xs: 3, sm: 2, md: 0 }}>
        <Typography level="title-md" textAlign="center">
          With your current company
        </Typography>
        <ApplicationStyledSelect
          data-testid={TEST_IDS.currentEmploymentTimeSelect}
          placeholder="Choose one"
          value={currEmployment}
          onChange={(_, val) => {
            setError("");
            setCurrEmployment(val || EmploymentTimeEnum.NA);
          }}
        >
          {Object.keys(EmploymentTimeEnum).map((option) => (
            <Option key={option} value={option}>
              {employmentTimeLabels[option as EmploymentTimeEnum]}
            </Option>
          ))}
        </ApplicationStyledSelect>
      </Flex>
      <Flex y xc gap1 fullwidth px={{ xs: 3, sm: 2, md: 0 }}>
        <Typography level="title-md" textAlign="center">
          With your previous company
        </Typography>
        <ApplicationStyledSelect
          data-testid={TEST_IDS.previousEmploymentTimeSelect}
          placeholder="Choose one"
          value={prevEmployment}
          onChange={(_, val) => {
            setError("");
            setPrevEmployment(val || EmploymentTimeEnum.NA);
          }}
        >
          {Object.keys(EmploymentTimeEnum).map((option) => (
            <Option key={option} value={option}>
              {employmentTimeLabels[option as EmploymentTimeEnum]}
            </Option>
          ))}
        </ApplicationStyledSelect>
      </Flex>
    </Flex>
  );
});
