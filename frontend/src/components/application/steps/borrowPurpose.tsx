import { Option } from '@mui/joy';
import { forwardRef, useMemo, useState } from 'react';
import { loanPurposesEnum, loanPurposesLabels } from '../../../constants/applicationData';
import { Flex } from '../../shared/flex';
import { ApplicationStyledInput } from '../styled/applicationStyledInput';
import { ApplicationStyledSelect } from '../styled/applicationStyledSelect';

export const BorrowPurposeStep = forwardRef<{ getValue: () => unknown }>(() => {
  const options = useMemo(() => Object.keys(loanPurposesEnum), []);

  const [option, setOption] = useState<string | undefined>();
  const [otherValue, setOtherValue] = useState<string>();

  return (
    <Flex y gap2 px={{ xs: 3, md: 0 }}>
      <ApplicationStyledSelect
        placeholder={'Choose one'}
        value={option}
        onChange={(_, val) => {
          setOption(val || undefined);
        }}
        sx={{ maxWidth: 400, mx: 'auto' }}
      >
        {options.map((option) => (
          <Option key={option} value={option}>
            {loanPurposesLabels[option as loanPurposesEnum]}
          </Option>
        ))}
      </ApplicationStyledSelect>
      {option === loanPurposesEnum.OTHER && (
        <ApplicationStyledInput
          onChange={(e) => {
            setOtherValue(e.target.value);
          }}
          value={otherValue}
          placeholder="Please specify"
        />
      )}
    </Flex>
  );
});
