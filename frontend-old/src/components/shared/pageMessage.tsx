import Typography from '@mui/joy/Typography';
import { useTheme } from '@mui/joy/styles/ThemeProvider';
import { SxProps } from '@mui/joy/styles/types';
import { FC, ReactElement, ReactNode, cloneElement } from 'react';
import { Flex } from './flex';

interface Props {
  title?: string;
  text?: string | ReactNode;
  icon: ReactElement;
  sx?: SxProps;
  iconSize?: 'sm' | 'md' | 'lg';
}

export const PageMessage: FC<Props> = ({ title, text, icon, sx, iconSize }) => {
  const theme = useTheme();
  const size = iconSize === 'lg' ? '100px' : iconSize === 'md' ? '70px' : '40px';
  return (
    <Flex y yc xc grow gap1 p={2} sx={sx}>
      {cloneElement(icon, { sx: { width: size, height: size, color: theme.palette.primary[500] } })}
      <Flex y yc xc>
        <Typography level="h4">{title}</Typography>
        <Typography textAlign={'center'} level={'body-md'}>
          {text}
        </Typography>
      </Flex>
    </Flex>
  );
};
