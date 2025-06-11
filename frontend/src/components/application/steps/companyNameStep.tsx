import { forwardRef, useState } from 'react';
import { TEST_IDS } from '../../../utils/testUtils';
import { Flex } from '../../shared/flex';
import { ApplicationStyledInput } from '../styled/applicationStyledInput';

export const CompanyNameStep = forwardRef<{ getValue: () => unknown }>(() => {
  const [value, setValue] = useState<string>('');

  return (
    <Flex y xc gap2 px={{ xs: 3, sm: 2, md: 0 }}>
      <ApplicationStyledInput
        value={value}
        data-testid={TEST_IDS.fullNameInput}
        placeholder={"Enter Company's name"}
        sx={{ maxWidth: { xs: '100%', sm: 300, md: 300 } }}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
    </Flex>
  );
});
