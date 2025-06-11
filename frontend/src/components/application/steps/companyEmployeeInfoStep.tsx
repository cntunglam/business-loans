import { forwardRef, useState } from 'react';
import { Flex } from '../../shared/flex';
import { ApplicationStyledInput } from '../styled/applicationStyledInput';

export const CompanyEmployeeInfoStep = forwardRef<{ getValue: () => unknown }>(() => {
  const [name, setName] = useState<string>('');
  const [position, setPosition] = useState<string>('');

  return (
    <Flex y xc gap2 px={{ xs: 3, sm: 2, md: 0 }}>
      <Flex y xc gap2 px={{ xs: 3, sm: 2, md: 0 }}>
        <ApplicationStyledInput
          value={name}
          placeholder={'Add your name'}
          sx={{ maxWidth: { xs: '100%', sm: 300, md: 300 } }}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <ApplicationStyledInput
          value={position}
          placeholder={'Add your position'}
          sx={{ maxWidth: { xs: '100%', sm: 300, md: 300 } }}
          onChange={(e) => {
            setPosition(e.target.value);
          }}
        />
      </Flex>
    </Flex>
  );
});
