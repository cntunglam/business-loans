import { Option } from '@mui/joy';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { loanPurposesEnum, loanPurposesLabels } from '../../../constants/applicationData';
import { useVisitorContext } from '../../../context/visitorContext';
import { Flex } from '../../shared/flex';
import { ApplicationStyledInput } from '../styled/applicationStyledInput';
import { ApplicationStyledSelect } from '../styled/applicationStyledSelect';

export const BorrowPurposeStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { setError, visitor } = useVisitorContext();

  const options = useMemo(() => Object.keys(loanPurposesEnum), []);

  const [option, setOption] = useState<string | undefined>(visitor?.borrowPurpose);
  const [otherValue, setOtherValue] = useState<string | undefined>();

  useEffect(() => {
    switch (visitor?.borrowPurpose) {
      case loanPurposesEnum.BRIDGING_LOAN:
      case loanPurposesEnum.BUSINESS_LINE_OF_CREDIT:
      case loanPurposesEnum.DEBT_CONSOLIDATION:
      case loanPurposesEnum.EDUCATION:
      case loanPurposesEnum.EXPANSION_FINANCING:
      case loanPurposesEnum.HOME:
      case loanPurposesEnum.INVOICE_FINANCING:
      case loanPurposesEnum.PAYROLL_FINANCING:
      case loanPurposesEnum.PURCHASE_ORDER_FINANCING:
      case loanPurposesEnum.REVENUE_BASED_FINANCE:
      case loanPurposesEnum.WORKING_CAPITAL_LOAN:
        setOption(visitor.borrowPurpose);
        setOtherValue(undefined);
        break;
      case '':
      case undefined:
      case null:
        setOption(undefined);
        setOtherValue(undefined);
        break;
      default:
        setOption(loanPurposesEnum.OTHER);
        setOtherValue(visitor?.borrowPurpose);
    }
  }, [visitor?.borrowPurpose]);

  useImperativeHandle(ref, () => ({
    getValue: () => (option === loanPurposesEnum.OTHER ? otherValue : option)
  }));

  return (
    <Flex y gap2 px={{ xs: 3, md: 0 }}>
      <ApplicationStyledSelect
        placeholder={'Choose one'}
        value={option || ''}
        onChange={(_, val) => {
          setOption(val || undefined);
          setError(''); // Clear error when a valid option is selected
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
          value={otherValue ?? ''}
          placeholder="Please specify"
        />
      )}
    </Flex>
  );
});
