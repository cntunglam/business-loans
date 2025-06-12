import { Box, Link as JoyLink } from '@mui/joy';
import { Link } from 'react-router-dom';
import useMediaQueries from '../../hooks/useMediaQueries';
import { Flex } from '../shared/flex';
import { RoshiLogo } from '../shared/roshiLogo';

export const Header = () => {
  const { sm } = useMediaQueries(['sm']);
  return (
    <Flex x xsb yc py={{ xs: 1, md: 2.3 }} px={{ xs: 3, md: 6 }} sx={{ borderBottom: '1px solid #E0E0E0' }} growChildren>
      <Box sx={{ visibility: { xs: 'visible', sm: 'hidden' } }}>
        <RoshiLogo
          smallLogo={!sm}
          sx={{
            display: 'flex',
            justifyContent: { xs: 'flex-start' },
            alignItems: 'center'
          }}
        />
      </Box>
      <Box sx={{ visibility: { xs: 'hidden', sm: 'visible' } }}>
        <RoshiLogo
          smallLogo={!sm}
          sx={{
            display: 'flex',
            justifyContent: { xs: 'center' },
            alignItems: 'center'
          }}
        />
      </Box>

      <Flex x xe>
        <JoyLink component={Link} color="secondary" to="/signin">
          {'Login'}
        </JoyLink>
      </Flex>
    </Flex>
  );
};
