import { Button } from '@mui/joy';
import { ApplicationSteps } from '@roshi/backend/services/applicationSteps.service';
import { ApplicationStepsEnum } from '@roshi/shared';
import { isBoolean } from 'lodash';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVisitorContext } from '../../../context/visitorContext';
import { TEST_IDS } from '../../../utils/testUtils';
import { Flex } from '../../shared/flex';

export const HasLaborContractStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { t } = useTranslation();
  const options = [
    { label: t('form:step_7.yes'), value: '1' },
    { label: t('form:step_7.no'), value: '0' }
  ];
  const { visitor } = useVisitorContext();
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    if (!visitor) return;
    try {
      const stepData = ApplicationSteps[ApplicationStepsEnum.hasLaborContract].validation(visitor[ApplicationStepsEnum.hasLaborContract]);
      if (isBoolean(stepData)) {
        setValue(stepData ? '1' : '0');
      }
    } catch (e) {
      // do nothing
    }
  }, [visitor]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return value === '1';
    }
  }));

  return (
    <Flex y gap={4}>
      <Flex y gap2 px={{ xs: 3, sm: 2, md: 0 }}>
        {options.map((option) => (
          <Button
            key={option.value}
            variant="outlined"
            color={value === option.value ? 'primary' : 'neutral'}
            onClick={() => {
              setValue(option.value);
            }}
            data-testid={option.value === '1' ? TEST_IDS.hasLaborContractYes : TEST_IDS.hasLaborContractNo}
            sx={{
              color: value === option.value ? 'primary.500' : 'neutral.400',
              minWidth: { xs: '200px', md: '400px' },
              outline: 'none !important',
              flexGrow: 1
            }}
            size="lg"
          >
            {option.label}
          </Button>
        ))}
      </Flex>
    </Flex>
  );
});
