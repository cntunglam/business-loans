import { Box } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import { ASSETS } from '../../data/assets';

export const RoshiLogo = ({ height = '40px', sx, smallLogo }: { height?: string; sx?: SxProps; smallLogo?: boolean }) => {
  return (
    <Box sx={{ height: height, ...sx }}>
      <img src={smallLogo ? ASSETS.ROSHI_LOGO_SMALL : ASSETS.ROSHI_LOGO} height={'100%'} />
    </Box>
  );
};
