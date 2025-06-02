import { Button, Typography } from '@mui/joy';
import { NonNullRT } from '@roshi/shared';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useGetCompanyStores } from '../../../api/useCompanyApi';
import { numberToDayOfWeek } from '../../../utils/utils';
import { Flex } from '../../shared/flex';
import { FlexGrid } from '../../shared/flexGrid';

interface Props {
  store: NonNullRT<typeof useGetCompanyStores>[number];
  loanResponseId: string;
  onClose: () => void;
  selectLocation: () => void;
}

export const StorePreview: FC<Props> = ({ store, selectLocation }) => {
  const { t } = useTranslation('common');
  return (
    <FlexGrid
      xs={12}
      sm={6}
      y
      key={store.id}
      minWidth={{ sm: '100%', md: '450px' }}
      p={1}
      sx={{
        boxShadow: 'md',
        border: 'none',
        borderRadius: '6px'
      }}
    >
      <Flex x xsb yc mb={2}>
        <Flex y>
          <Typography component={Link} sx={{ textDecoration: 'none' }} target="_blank" to={store.mapsUrl} level="title-lg">
            {store.name}
          </Typography>
        </Flex>
        <Button onClick={() => selectLocation()} sx={{ mt: 2 }}>
          {t('select')}
        </Button>
      </Flex>
      {store.mapsEmbedUrl ? (
        <iframe src={store.mapsEmbedUrl} width="100%" height={'275px'} style={{ border: 0 }} />
      ) : (
        <img src={store.imageUrl} width="100%" height={'275px'} style={{ objectFit: 'cover', objectPosition: 'center' }} />
      )}
      <Typography level="body-md" my={1}>
        {store.address}
      </Typography>
      <Flex y sx={{ rowGap: '9px', px: 1 }}>
        {store.openingHours.map((hour) => (
          <Flex x xsb yc>
            <Typography level="title-sm" key={hour.id} fontWeight={'700'}>
              {numberToDayOfWeek(hour.dayOfWeek)}
            </Typography>
            <Typography level="title-sm" fontWeight={'700'}>
              {hour.isOpen ? `${hour.openHour} - ${hour.closeHour}` : t('closed')}
            </Typography>
          </Flex>
        ))}
      </Flex>
    </FlexGrid>
  );
};
