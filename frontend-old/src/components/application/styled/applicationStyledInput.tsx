import { Input, InputProps } from '@mui/joy';
import { FC } from 'react';

export const ApplicationStyledInput: FC<InputProps> = (props) => {
  const { sx, ...rest } = props;

  return <Input size="lg" sx={{ width: { sm: '400px', xs: '100%' }, ...sx }} {...rest} />;
};
