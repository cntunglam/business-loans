import { forwardRef, useImperativeHandle, useState } from 'react';
import { useVisitorContext } from '../../../context/visitorContext';
import { RsSlider } from '../../shared/rsSlider';

export const BorrowAmountStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { visitor } = useVisitorContext();
  const [value, setValue] = useState<number>(visitor?.borrowAmount || 200_000);

  useImperativeHandle(ref, () => ({
    getValue: () => value
  }));

  return <RsSlider step={500} prefix={'$'} min={50_000} max={500_000} value={value} setValue={setValue} />;
});

BorrowAmountStep.displayName = 'BorrowAmountStep';
