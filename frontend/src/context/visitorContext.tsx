import { Prisma } from "@prisma/client";
import { ApplicationStepsEnum, ERROR_KEYS, LoanRequestTypeEnum, StepDetails } from "@roshi/shared";
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetAffiliateVisitor } from "../api/useAffiliateApi";
import { useFinalizeLoanRequest, useInitializeVisitor, useSaveStepProgress } from "../api/useVisitorApi";
import { KEYS, TIME_CONSTANTS } from "../data/constants";
import { getErrorMessage, isErrorResponse } from "../utils/errorHandler";
import { getFromLocalStorage, saveToLocalStorage } from "../utils/localStorageHelper";

type VisitorWithSteps = Prisma.VisitorDataV2GetPayload<{
  include: { stepData: true };
}>;

interface VisitorContextType {
  visitor?: VisitorWithSteps | null;
  isLoading: boolean;
  error?: string;
  init: (type: LoanRequestTypeEnum, referer?: string) => Promise<VisitorWithSteps | null>;
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
  isLoading: false,
  currentStepIndex: 0,
  currentStepData: undefined,
  init: () => Promise.reject(new Error("Context not initialized")),
  saveStep: () => Promise.reject(new Error("Context not initialized")),
  finalize: () => Promise.reject(new Error("Context not initialized")),
  setError: () => {},
  goBack: () => {},
  steps: [],
};

const visitorContext = createContext<VisitorContextType>(defaultContext);

export const VisitorProvider = ({ children }: { children: ReactNode }) => {
  const [params, setParams] = useSearchParams();
  const [visitorData, setVisitorData] = useState<VisitorWithSteps>();
  const [steps, setSteps] = useState<StepDetails[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const navigate = useNavigate();
  const currentStepIndex = params.get("step") ? parseInt(params.get("step") as string) : 0;
  const setStep = useCallback((step: number) => setParams({ step: step.toString() }), [setParams]);
  const currentStepData = useMemo(() => (steps ? steps[currentStepIndex] : undefined), [steps, currentStepIndex]);

  const visitorId = params.get("affiliateVisitorId");
  const initializeVisitor = useInitializeVisitor();
  const { data: affiliateVisitor } = useGetAffiliateVisitor(visitorId);

  const saveStepProgress = useSaveStepProgress();
  const finalizeLoanRequest = useFinalizeLoanRequest();

  useEffect(() => {
    if (affiliateVisitor) {
      saveToLocalStorage(KEYS.AFFILIATE_VISITOR_ID_KEY, affiliateVisitor.id, TIME_CONSTANTS.ONE_DAY);
    }
  }, [affiliateVisitor]);

  const init = useCallback(
    async (type: LoanRequestTypeEnum, referer?: string) => {
      try {
        setIsLoading(true);
        setError(undefined);
        const visitorId = getFromLocalStorage<string>(KEYS.VISITOR_ID_KEY);

        if (visitorData?.id === visitorId && visitorData?.loanRequestType === type) {
          return visitorData;
        }

        let data = await initializeVisitor.mutateAsync({
          visitorId: visitorId || undefined,
          loanRequestType: type,
          referer,
        });

        if (data.visitor.isCompleted) {
          //If the visitor has completed the application previously, we create a new visitorData
          data = await initializeVisitor.mutateAsync({
            loanRequestType: type,
            referer,
          });
        }

        if (data.visitor.id) {
          saveToLocalStorage(KEYS.VISITOR_ID_KEY, data.visitor.id, TIME_CONSTANTS.ONE_DAY);
        }

        setVisitorData(data.visitor);
        setSteps(data.steps);
        return data.visitor;
      } catch (err) {
        setError(err instanceof Error ? err.message : ERROR_KEYS.INTERNAL_ERROR);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [initializeVisitor, visitorData]
  );

  const saveStep = useCallback(
    async (stepKey: string, stepData?: unknown) => {
      try {
        setIsLoading(true);
        setError(undefined);

        if (!visitorData?.id) {
          throw new Error("Visitor ID not initialized");
        }

        const updatedVisitorData = await saveStepProgress.mutateAsync({
          visitorId: visitorData.id,
          stepKey: stepKey as ApplicationStepsEnum,
          data: stepData,
        });

        if (updatedVisitorData) {
          setVisitorData(updatedVisitorData);
          if (steps && currentStepIndex < steps.length) setStep(currentStepIndex + 1);
        }
      } catch (err) {
        setError(isErrorResponse(err) ? getErrorMessage(err) : "An error occured");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [visitorData?.id, saveStepProgress, steps, currentStepIndex, setStep]
  );

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const finalize = useCallback(
    async (override?: boolean) => {
      if (!visitorData?.id) {
        throw new Error("Visitor ID not initialized");
      }
      try {
        setIsLoading(true);
        setError(undefined);
        const affiliateVisitorId = getFromLocalStorage<string>(KEYS.AFFILIATE_VISITOR_ID_KEY);
        await finalizeLoanRequest.mutateAsync({ visitorId: visitorData?.id, override, affiliateVisitorId });
      } catch (err) {
        setError(err instanceof Error ? err.message : ERROR_KEYS.INTERNAL_ERROR);
        throw err;
      } finally {
        localStorage.removeItem(KEYS.AFFILIATE_VISITOR_ID_KEY);
        setIsLoading(false);
      }
    },
    [finalizeLoanRequest, visitorData?.id]
  );

  const value = useMemo(
    () => ({
      visitor: visitorData,
      isLoading: isLoading || initializeVisitor.isPending || finalizeLoanRequest.isPending,
      error,
      init,
      saveStep,
      finalize,
      setError,
      steps: steps || [],
      currentStepIndex,
      currentStepData,
      goBack,
    }),
    [
      visitorData,
      isLoading,
      initializeVisitor.isPending,
      finalizeLoanRequest.isPending,
      error,
      init,
      saveStep,
      finalize,
      steps,
      currentStepIndex,
      currentStepData,
      goBack,
    ]
  );

  return <visitorContext.Provider value={value}>{children}</visitorContext.Provider>;
};

export const useVisitorContext = () => useContext(visitorContext);
