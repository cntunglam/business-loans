import { forwardRef, useImperativeHandle, useState } from 'react';
import { useVisitorContext } from '../../../context/visitorContext';
import { Flex } from '../../shared/flex';
import { ApplicationStyledInput } from '../styled/applicationStyledInput';

export const CompanyNameStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { visitor } = useVisitorContext();

  const [value, setValue] = useState<string>(visitor?.companyName || '');

  useImperativeHandle(ref, () => ({
    getValue: () => value
  }));

  return (
    <Flex y xc gap2 px={{ xs: 3, sm: 2, md: 0 }}>
      <ApplicationStyledInput
        value={value}
        placeholder={"Enter Company's name"}
        sx={{ maxWidth: { xs: '100%', sm: 300, md: 300 } }}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
    </Flex>
  );
});
