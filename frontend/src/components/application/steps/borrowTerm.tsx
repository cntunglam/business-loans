import { forwardRef, useImperativeHandle, useState } from 'react';
import { useVisitorContext } from '../../../context/visitorContext';
import { RsSlider } from '../../shared/rsSlider';

export const BorrowTermStep = forwardRef<{ getValue: () => unknown }>((_, ref) => {
  const { visitor } = useVisitorContext();

  const [value, setValue] = useState<number>(visitor?.borrowPeriod || 20);

  useImperativeHandle(ref, () => ({
    getValue: () => value
  }));

  return <RsSlider step={1} suffix={' months'} min={1} max={60} value={value} setValue={setValue} />;
});

BorrowTermStep.displayName = 'BorrowTermStep';
