import { Box, Typography } from '@mui/joy';
import { useTranslation } from 'react-i18next';
import { ASSETS } from '../../data/assets';
import { Flex } from '../shared/flex';

export const PromotionalBanners = () => {
  const { t } = useTranslation();
  return (
    <Flex x>
      <Flex
        flex={1}
        sx={{
          p: 2,
          borderRadius: '5px',
          border: '1px solid var(--joy-palette-secondary-100)',
          justifyContent: { xs: 'center', sm: 'initial' }
        }}
      >
        <Flex x gap1 yc>
          <Box display={{ xs: 'none', sm: 'block' }}>
            <img src={ASSETS.ZERO_FEE} height="56px" width="56px" />
          </Box>
          <Flex y ml={1}>
            <Flex x yc gap1>
              <Flex sx={{ display: { xs: 'flex', sm: 'none' } }}>
                <img src={ASSETS.ZERO_FEE} height="24px" width="24px" />
              </Flex>
              <Typography fontWeight={800} textColor={'secondary.500'} level="title-sm">
                {t('form:promotionalbanners.title')}
              </Typography>
            </Flex>
            <Typography level="body-xs" display={{ xs: 'none', sm: 'block' }}>
              {t('form:promotionalbanners.description')}
            </Typography>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
