import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import z from 'zod';
import { DEFAULT_APPLICATION_STEPS } from '../constants/applicationData';
import { ApplicationStepsEnum, StepDetails } from '../constants/applicationStep';

export type VisitorWithSteps = {
  currentStep: string;
  isCompleted: boolean;
  borrowAmount: number;
  borrowPeriod: number;
  borrowPurpose: string;
  companyName: string;
  companyEmployeeInfo: {
    name: string;
    position: string;
  };
  companyUENumber: string;
};

const validator = {
  [ApplicationStepsEnum.borrowAmount]: z
    .number()
    .min(50_000, 'Borrow amount must be at least $50,000')
    .max(500_000, 'Borrow amount must not exceed $500,000'),
  [ApplicationStepsEnum.borrowPeriod]: z
    .number()
    .min(1, 'Borrow period must be at least 1 month')
    .max(60, 'Borrow period must not exceed 60 months'),
  [ApplicationStepsEnum.borrowPurpose]: z
    .string({
      required_error: 'Borrow purpose is required'
    })
    .nonempty('Borrow purpose should not be empty'),
  [ApplicationStepsEnum.companyName]: z
    .string({
      required_error: 'Company name is required'
    })
    .nonempty('Company name should not be empty'),

  [ApplicationStepsEnum.companyUENumber]: z
    .string({
      required_error: 'Company UENumber is required'
    })
    .nonempty('Company UENumber should not be empty'),
  [ApplicationStepsEnum.companyEmployeeInfo]: z.object({
    name: z
      .string({
        required_error: 'Name is required'
      })
      .nonempty('Name should not be empty'),
    position: z
      .string({
        required_error: 'Position is required'
      })
      .nonempty('Position should not be empty')
  })
};

export enum LoanRequestTypeEnum {
  GENERAL = 'GENERAL',
  ZERO_INTEREST = 'ZERO_INTEREST'
}

interface VisitorContextType {
  visitor?: VisitorWithSteps | null;
  error?: string;
  init: () => Promise<unknown>;
  saveStep: (stepKey: string, stepData?: unknown) => Promise<void>;
  finalize: (override?: boolean) => Promise<void>;
  steps: StepDetails[];
  currentStepIndex: number;
  currentStepData?: StepDetails;
  goBack: () => void;
  setError: (error: string) => void;
}

const defaultContext: VisitorContextType = {
  visitor: undefined,
  currentStepIndex: 0,
  currentStepData: undefined,
  init: () => Promise.reject(new Error('Context not initialized')),
  saveStep: () => Promise.reject(new Error('Context not initialized')),
  finalize: () => Promise.reject(new Error('Context not initialized')),
  setError: () => {},
  goBack: () => {},
  steps: []
};

const visitorContext = createContext<VisitorContextType>(defaultContext);

export const VisitorProvider = ({ children }: { children: React.ReactNode }) => {
  const [visitorData, setVisitorData] = useState<VisitorWithSteps>({
    currentStep: '',
    isCompleted: false,
    borrowAmount: 200_000,
    borrowPeriod: 20,
    borrowPurpose: '',
    companyName: '',
    companyEmployeeInfo: {
      name: '',
      position: ''
    },
    companyUENumber: ''
  });
  const steps = useMemo(() => DEFAULT_APPLICATION_STEPS, []);
  const [error, setError] = useState<string>();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStepData = useMemo(() => (steps ? steps[currentStepIndex] : undefined), [steps, currentStepIndex]);

  const setStep = useCallback((step: number) => setCurrentStepIndex(step), []);

  const init = useCallback(async () => {}, []);

  const saveStep = useCallback(
    async (stepKey: string, stepData?: unknown) => {
      if (!currentStepData) {
        throw new Error('Current step data is not available');
      }

      const parsedData = validator[currentStepData.key as ApplicationStepsEnum].safeParse(stepData);

      if (!parsedData.success) {
        const parsedError = JSON.parse(parsedData.error.message)?.[0]?.message;

        setError(parsedError);
      } else {
        console.log(stepData);
        // Logic to save the step data...
        setVisitorData((prev) => ({
          ...prev,
          [stepKey]: stepData
        }));

        if (error) {
          setError(undefined);
        }

        // Move to the next step if applicable
        if (currentStepIndex < steps.length) {
          setStep(currentStepIndex + 1);
        }
      }
    },
    [currentStepData, error, currentStepIndex, steps.length, setStep]
  );

  const finalize = useCallback(
    async (override = false) => {
      // Finalization logic...
      if (override) {
        setVisitorData((prev) => ({ ...prev, isCompleted: true }));
      }
    },
    [setVisitorData]
  );

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setStep(currentStepIndex - 1);
      setError(undefined);
    }
  }, [currentStepIndex, setStep]);

  return (
    <visitorContext.Provider
      value={{
        visitor: visitorData,
        error,
        init,
        saveStep,
        finalize,
        steps,
        currentStepIndex,
        currentStepData,
        goBack,
        setError
      }}
    >
      {children}
    </visitorContext.Provider>
  );
};

export const useVisitorContext = () => {
  const context = useContext(visitorContext);
  if (!context) {
    throw new Error('useVisitorContext must be used within a VisitorProvider');
  }
  return context;
};
