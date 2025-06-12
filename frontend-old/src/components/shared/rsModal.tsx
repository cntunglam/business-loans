import { DialogTitle, Divider, Modal, ModalClose, ModalDialog } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import { FC, ReactNode } from 'react';
import useMediaQueries from '../../hooks/useMediaQueries';
import { Flex } from './flex';

interface Props {
  children?: ReactNode;
  onClose?: () => void;
  title?: string;
  fullscreenOnMobile?: boolean;
  sx?: SxProps;
  disableClickOutside?: boolean;
  minWidth?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingsY = {
  sm: 2,
  md: 6,
  lg: 8
};
const paddingsX = {
  sm: 2,
  md: 4,
  lg: 6
};

export const RsModal: FC<Props> = ({ onClose, children, title, sx, fullscreenOnMobile, disableClickOutside, minWidth, padding = 'md' }) => {
  const { sm } = useMediaQueries(['sm']);
  return (
    <Modal
      open={true}
      onClose={(_, reason) => {
        if (reason === 'backdropClick' && disableClickOutside) return;
        onClose?.();
      }}
    >
      <ModalDialog
        layout={fullscreenOnMobile ? (sm ? 'center' : 'fullscreen') : undefined}
        minWidth={minWidth || '900px'}
        sx={{
          gap: 0,
          overflowY: 'auto',
          py: sm ? paddingsY[padding] : 2,
          pt: 2,
          px: sm ? paddingsX[padding] : 2,
          ...sx
        }}
      >
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          {title && <DialogTitle sx={{ fontWeight: '700', fontSize: '20px' }}>{title}</DialogTitle>}
          {onClose && <ModalClose />}
        </Flex>
        <Divider sx={{ mt: title ? 2 : 4 }} />
        <Flex x y yc xc grow pt={3}>
          {children}
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
