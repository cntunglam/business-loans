import { forwardRef, useImperativeHandle, useState } from 'react';
import { useVisitorContext } from '../../../context/visitorContext';
import { Flex } from '../../shared/flex';
import { ApplicationStyledInput } from '../styled/applicationStyledInput';

export const CompanyUENumberStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { visitor } = useVisitorContext();

  const [value, setValue] = useState<string>(visitor?.companyUENumber || '');

  useImperativeHandle(ref, () => ({
    getValue: () => value
  }));

  return (
    <Flex y xc gap2 px={{ xs: 3, sm: 2, md: 0 }}>
      <ApplicationStyledInput
        value={value}
        placeholder={'Enter UEN'}
        sx={{ maxWidth: { xs: '100%', sm: 300, md: 300 } }}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
    </Flex>
  );
});
