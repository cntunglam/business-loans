import { Box, Button, LinearProgress, Link, Typography } from '@mui/joy';
import { ApplicationStepsImagesEnum, UserRoleEnum } from '@roshi/shared';
import { differenceInHours, format } from 'date-fns';
import { cloneElement, ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Balancer from 'react-wrap-balancer';
import { useGetMyLoanRequest, useRestoreMyLoanRequest } from '../../api/useLoanRequestApi';
import { useUserContext } from '../../context/userContext';
import { useVisitorContext } from '../../context/visitorContext';
import { ApplicationStepsComponents, ApplicationStepsImages } from '../../data/applicationStepsComponents';
import useMediaQueries from '../../hooks/useMediaQueries';
import { TEST_IDS } from '../../utils/testUtils';
import { DASHBOARD_REDIRECTS } from '../authentication/authorization';
import WarningIcon from '../icons/warningIcon';
import { Flex } from '../shared/flex';
import { RsModal } from '../shared/rsModal';
import { RegisterStep } from './steps/registerStep';

const isWithinLast24Hours = (date: Date) => {
  return differenceInHours(new Date(), date) < 24;
};

export const LoanApplication = () => {
  const { steps, saveStep, goBack, currentStepData, error, currentStepIndex, isLoading, finalize } = useVisitorContext();
  const restoreMyLoanRequest = useRestoreMyLoanRequest();

  const { data: loanRequest, isFetching: isLoanRequestFetching, refetch: refetchLoanRequest } = useGetMyLoanRequest();
  const [confirmationModalOpen, setConfirmationModalOpen] = useState<{
    open: boolean;
    finalizing: boolean;
    type: 'isActiveWithinLast24Hours' | 'isOverridden' | 'isWithdrawnWithinLast24Hours';
  }>();
  const { user } = useUserContext();
  const isLoaded = useRef(false);

  const navigate = useNavigate();

  const currentStepRef = useRef<{
    getValue: () => unknown;
  }>(null);

  const [stepComponent, imgToRender] = useMemo(() => {
    if (!currentStepData) return [null, null];
    return [
      ApplicationStepsComponents[currentStepData.key as keyof typeof ApplicationStepsComponents],
      currentStepData.image ? ApplicationStepsImages[currentStepData.image as ApplicationStepsImagesEnum] : null
    ];
  }, [currentStepData]);

  const { t } = useTranslation();
  const { md } = useMediaQueries(['md']);

  const stepProgress = useMemo(
    () => Math.min(steps.length ? (currentStepIndex / (steps.length - 1)) * 100 : 0, 100),
    [currentStepIndex, steps]
  );

  const finalizeHandler = async (override: boolean) => {
    await finalize(override)
      .then(async () => await refetchLoanRequest())
      .then(() => navigate(DASHBOARD_REDIRECTS[UserRoleEnum.BORROWER]));
  };

  const restoreHandler = async () => {
    if (!loanRequest) return null;
    restoreMyLoanRequest
      .mutateAsync({ id: loanRequest.id })
      .then(async () => await refetchLoanRequest())
      .then(() => navigate(DASHBOARD_REDIRECTS[UserRoleEnum.BORROWER]));
  };

  const tryFinalize = async () => {
    const lr = (await refetchLoanRequest()).data;

    if (lr && lr.isWithdrawn && isWithinLast24Hours(lr.createdAt)) {
      setConfirmationModalOpen({
        finalizing: true,
        open: true,
        type: 'isWithdrawnWithinLast24Hours'
      });
      return;
    }
    if (lr && !lr.isExpired && !lr.isFullfilled && !lr.isWithdrawn) {
      setConfirmationModalOpen({
        finalizing: true,
        open: true,
        type: isWithinLast24Hours(lr.createdAt) ? 'isActiveWithinLast24Hours' : 'isOverridden'
      });
      return;
    }
    await finalizeHandler(false);
  };

  const onNext = async () => {
    const val = currentStepRef.current?.getValue();
    if (val !== null && currentStepData) {
      await saveStep(currentStepData.key, val);
    }

    // Don't finalize if user is not logged in. We will show registration step
    if (!user || !user.phone) return;
    if (currentStepIndex === steps.length - 1) {
      tryFinalize();
    }
  };

  const renderConfirmationModal = () => {
    if (!loanRequest) return null;
    if (confirmationModalOpen?.type === 'isActiveWithinLast24Hours') {
      return (
        <RsModal title="You Already Have an Ongoing Application">
          <Typography textAlign="center">
            You have already submitted an application within the last 24 hours. Please try again later.
          </Typography>
          <Flex y xc gap2 mt={3}>
            <Link color="neutral" underline="always" onClick={() => navigate(DASHBOARD_REDIRECTS[UserRoleEnum.BORROWER])}>
              Go to my dashboard
            </Link>
          </Flex>
        </RsModal>
      );
    }

    if (confirmationModalOpen?.type === 'isWithdrawnWithinLast24Hours') {
      return (
        <RsModal title="Recent Application Detected">
          <Typography textAlign="center">
            You recently canceled an application within the last 24 hours. Would you like to restore and continue with that application?
          </Typography>
          <Flex y xc gap2 mt={3}>
            <Link color="neutral" underline="always" onClick={() => navigate(DASHBOARD_REDIRECTS[UserRoleEnum.BORROWER])}>
              Go to my dashboard
            </Link>

            <Button loading={isLoading || isLoanRequestFetching} onClick={restoreHandler}>
              Yes, Restore
            </Button>
          </Flex>
        </RsModal>
      );
    }

    return (
      <RsModal title="Override existing application">
        <Typography textAlign="center">
          You already have an ongoing application from <b>{format(loanRequest.createdAt, 'dd MMM yyyy')}</b> <br /> Would you like to
          withdraw your existing application and apply again?
        </Typography>
        <Flex y xc gap2 mt={3}>
          <Link color="neutral" underline="always" onClick={() => navigate(DASHBOARD_REDIRECTS[UserRoleEnum.BORROWER])}>
            No, take me to my existing application
          </Link>
          <Button
            loading={isLoading || isLoanRequestFetching}
            onClick={() => {
              if (confirmationModalOpen?.finalizing) {
                finalizeHandler(true);
              } else {
                setConfirmationModalOpen(undefined);
              }
            }}
          >
            I want to apply again
          </Button>
        </Flex>
      </RsModal>
    );
  };

  useEffect(() => {
    if (!user) {
      isLoaded.current = true;
    }

    if (loanRequest && loanRequest.isWithdrawn && isWithinLast24Hours(loanRequest.createdAt) && !isLoaded.current) {
      setConfirmationModalOpen({
        finalizing: true,
        open: true,
        type: 'isWithdrawnWithinLast24Hours'
      });
      return;
    }
    if (loanRequest && !loanRequest.isWithdrawn && !loanRequest.isExpired && !loanRequest.isFullfilled && !isLoaded.current) {
      isLoaded.current = true;
      setConfirmationModalOpen({
        finalizing: false,
        open: true,
        type: isWithinLast24Hours(loanRequest.createdAt) ? 'isActiveWithinLast24Hours' : 'isOverridden'
      });
    }
  }, [user, loanRequest]);

  return (
    <Flex>
      {confirmationModalOpen?.open && renderConfirmationModal()}
      {md && imgToRender && (
        <Box sx={{ height: '100vh', width: 420, textAlign: 'center' }} bgcolor={'#FCF9FF'}>
          <img src={imgToRender} style={{ width: '100%' }} alt="" />
        </Box>
      )}
      <Flex y xc grow py={2} px={1}>
        <Flex
          fullwidth
          y
          xc
          mt={2}
          px={2}
          mb={5}
          sx={{ width: { xs: 'calc(100% - 17.5px)', md: 'calc(100% - 100px)' }, maxWidth: '820px' }}
        >
          <LinearProgress
            determinate
            value={stepProgress}
            thickness={10}
            sx={{
              width: '100%',
              flexGrow: 1,
              '--LinearProgress-radius': '10px',
              '--LinearProgress-track-color': '#E5E5E5'
            }}
          />
        </Flex>

        {currentStepData?.title && (
          <Flex
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              textWrap: 'wrap'
            }}
          >
            <Typography
              fontWeight={800}
              textColor={'secondary.500'}
              level="title-lg"
              fontSize={{ xs: '1.75rem', md: '2.125rem' }}
              textAlign="center"
              mb={4}
              maxWidth={600}
            >
              <Balancer>{currentStepData.title}</Balancer>
            </Typography>
          </Flex>
        )}

        <Flex
          y
          minHeight="250px"
          sx={{
            width: {
              sm: '400px',
              xs: '100%'
            }
          }}
          rowGap={6}
        >
          {currentStepIndex >= steps.length && (!user || !user.phone) ? (
            <>
              <RegisterStep onSuccess={() => tryFinalize()} isLoading={isLoading || isLoanRequestFetching} />
            </>
          ) : (
            <>
              <Flex y>
                {stepComponent &&
                  cloneElement(stepComponent as ReactElement, {
                    ref: currentStepRef
                  })}
                {error && (
                  <Flex x xc mt={1} gap1>
                    <WarningIcon color="danger" />
                    <Typography textAlign={'center'} textColor="danger.500">
                      {error}
                    </Typography>
                  </Flex>
                )}
              </Flex>
              <Flex y yst xc gap3 minHeight={'100px'}>
                <Button
                  onClick={onNext}
                  loading={isLoading || isLoanRequestFetching}
                  sx={{
                    width: 230,
                    outline: 'none !important'
                  }}
                  size="lg"
                  data-testid={TEST_IDS.nextStepButton}
                >
                  {t('next')}
                </Button>
                {currentStepIndex !== 0 && !isLoading && !isLoanRequestFetching && (
                  <Link textColor={'neutral.400'} onClick={goBack}>
                    {t('back')}
                  </Link>
                )}
              </Flex>
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
