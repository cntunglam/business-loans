import { forwardRef, useState } from 'react';
import { RsSlider } from '../../shared/rsSlider';

export const BorrowAmountStep = forwardRef<{ getValue: () => unknown }>(() => {
  const [value, setValue] = useState<number>(200_000);

  return <RsSlider step={500} prefix={'$'} min={50_000} max={500_000} value={value} setValue={setValue} />;
});

BorrowAmountStep.displayName = 'BorrowAmountStep';
