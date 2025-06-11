import { forwardRef, useState } from 'react';
import { RsSlider } from '../../shared/rsSlider';

export const BorrowTermStep = forwardRef<{ getValue: () => unknown }>(() => {
  const [value, setValue] = useState<number>(20);

  return <RsSlider step={1} suffix={' months'} min={1} max={60} value={value} setValue={setValue} />;
});

BorrowTermStep.displayName = 'BorrowTermStep';
