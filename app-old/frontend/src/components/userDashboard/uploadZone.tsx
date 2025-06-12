import { Card, CircularProgress, Typography } from '@mui/joy';
import { FC, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { ASSETS } from '../../data/assets';
import useMediaQueries from '../../hooks/useMediaQueries';
import { Flex } from '../shared/flex';

interface Props {
  onSuccess: (file: File) => void;
  isLoading?: boolean;
}

export const UploadZone: FC<Props> = ({ onSuccess, isLoading }) => {
  const { t } = useTranslation();
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onSuccess(acceptedFiles[0]);
    },
    [onSuccess]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpeg', '.jpg'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  });

  const isMobile = useMediaQueries(['sm']);
  return (
    <Flex
      y
      yc
      xc
      pointer
      minHeight={'50px'}
      component={Card}
      {...getRootProps()}
      sx={{ border: '1px dashed rgba(234, 234, 234, 1)', backgroundColor: 'neutral.50' }}
    >
      {isLoading ? (
        <CircularProgress size="sm" />
      ) : (
        <>
          <input {...getInputProps()} />
          <Typography level="body-lg" gap={1} startDecorator={<img src={ASSETS.UPLOAD} />}>
            {!isMobile.sm ? 'Upload files' : t('form:documentlist.select')}
          </Typography>
        </>
      )}
    </Flex>
  );
};
