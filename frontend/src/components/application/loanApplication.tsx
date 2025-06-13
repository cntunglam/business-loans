import { Box, Button, LinearProgress, Link, Typography } from '@mui/material';
import { cloneElement, ReactElement, useMemo, useRef } from 'react';
import Balancer from 'react-wrap-balancer';
import { ApplicationStepsImagesEnum } from '../../constants/applicationStep';
import { useVisitorContext } from '../../context/visitorContext';
import { ApplicationStepsComponents, ApplicationStepsImages } from '../../data/applicationStepsComponents';
import WarningIcon from '../icons/warningIcon';
import { Flex } from '../shared/flex';
import FinishStep from './steps/finishStep';

export const LoanApplication = () => {
  const { currentStepData, currentStepIndex, steps, saveStep, goBack, error } = useVisitorContext();

  const currentStepRef = useRef<{
    getValue: () => unknown;
  }>(null);

  const stepProgress = useMemo(() => (currentStepIndex + 1) * (100 / steps.length), [currentStepIndex, steps.length]);
  const [stepComponent, imgToRender] = useMemo(() => {
    if (!currentStepData) {
      return [null, null];
    }

    return [
      ApplicationStepsComponents[currentStepData.key as keyof typeof ApplicationStepsComponents],
      currentStepData.image ? ApplicationStepsImages[currentStepData.image as ApplicationStepsImagesEnum] : null
    ];
  }, [currentStepData]);

  const onNextStep = () => {
    const value = currentStepRef.current?.getValue();

    if (currentStepData) {
      saveStep(currentStepData.key, value);
    }
  };

  return (
    <Flex>
      {imgToRender && (
        <Box sx={{ height: '100vh', width: 420, textAlign: 'center', display: { xs: 'none', md: 'block' } }} bgcolor={'#FCF9FF'}>
          <img src={imgToRender ?? ''} style={{ width: '100%' }} alt="" />
        </Box>
      )}

      <Flex y xc grow px={{ xs: 2, lg: 12.5 }} py={{ xs: 2, lg: 7.5 }}>
        {currentStepData && (
          <Flex fullwidth y xc mb={7.5}>
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
        )}

        {currentStepData?.title && (
          <Flex xc>
            <Typography
              fontWeight={800}
              textColor={'secondary.500'}
              level="title-lg"
              fontSize={{ xs: '1.75rem', md: '2.125rem' }}
              textAlign="center"
              mb={5}
              maxWidth={{
                xs: '100%',
                lg: 537
              }}
            >
              <Balancer>{currentStepData.title}</Balancer>
            </Typography>
          </Flex>
        )}

        <Flex
          y
          minHeight="250px"
          rowGap={12.5}
          sx={{
            width: {
              xs: '100%',
              md: 'auto'
            }
          }}
        >
          {currentStepIndex >= steps.length && <FinishStep />}
          {currentStepIndex < steps.length && (
            <>
              <Flex y fullwidth>
                {stepComponent && cloneElement(stepComponent as ReactElement, { ref: currentStepRef })}

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
                  onClick={onNextStep}
                  sx={{
                    width: {
                      xs: '100%',
                      lg: 320
                    },
                    outline: 'none !important',
                    minHeight: '3rem',
                    fontWeight: 800
                  }}
                  size="lg"
                >
                  {'Next'}
                </Button>

                {currentStepIndex !== 0 && (
                  <Link textColor={'neutral.600'} sx={{ textDecorationColor: 'var(--joy-palette-neutral-600)' }} onClick={goBack}>
                    {'Back'}
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
