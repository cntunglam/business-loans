import { Box, Button, LinearProgress, Link, Typography } from '@mui/material';
import { cloneElement, ReactElement, useMemo, useState } from 'react';
import Balancer from 'react-wrap-balancer';
import { DEFAULT_APPLICATION_STEPS } from '../../constants/applicationData';
import { ApplicationStepsImagesEnum } from '../../constants/applicationStep';
import { ApplicationStepsComponents, ApplicationStepsImages } from '../../data/applicationStepsComponents';
import { Flex } from '../shared/flex';
import FinishStep from './steps/finishStep';

export const LoanApplication = () => {
  const steps = useMemo(() => DEFAULT_APPLICATION_STEPS, []);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStepData = useMemo(() => steps[currentStepIndex], [steps, currentStepIndex]);

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

  return (
    <Flex>
      {imgToRender && (
        <Box sx={{ height: '100vh', width: 420, textAlign: 'center' }} bgcolor={'#FCF9FF'}>
          <img src={imgToRender ?? ''} style={{ width: '100%' }} alt="" />
        </Box>
      )}

      <Flex y xc grow py={7.5} px={12.5}>
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
              maxWidth={537}
            >
              <Balancer>{currentStepData.title}</Balancer>
            </Typography>
          </Flex>
        )}

        <Flex y minHeight="250px" rowGap={12.5}>
          {currentStepIndex >= steps.length && <FinishStep />}
          {currentStepIndex < steps.length && (
            <>
              <Flex y>{stepComponent && cloneElement(stepComponent as ReactElement)}</Flex>
              <Flex y yst xc gap3 minHeight={'100px'}>
                <Button
                  onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                  sx={{
                    width: 320,
                    outline: 'none !important',
                    minHeight: '3rem',
                    fontWeight: 800
                  }}
                  size="lg"
                >
                  {'Next'}
                </Button>
                {currentStepIndex !== 0 && (
                  <Link
                    textColor={'neutral.600'}
                    sx={{ textDecorationColor: 'var(--joy-palette-neutral-600)' }}
                    onClick={() => setCurrentStepIndex((prev) => prev - 1)}
                  >
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
