import { Typography } from '@mui/joy';
import { ReactNode } from 'react';
import { Flex } from '../shared/flex';

export const ApplicationDetailsLine = ({ title, value, Icon }: { title: string; value: string | ReactNode; Icon?: ReactNode }) => {
  return (
    <Flex
      x
      gap1
      xsb
      yc
      py={1}
      px={2}
      sx={{
        ':nth-child(even)': { backgroundColor: 'background.level1' }
      }}
    >
      <Flex x gap2 yc>
        {Icon}
        <Typography fontWeight={'500'}>{title}</Typography>
      </Flex>
      <Typography textAlign={'end'} fontWeight={'600'}>
        {value}
      </Typography>
    </Flex>
  );
};
