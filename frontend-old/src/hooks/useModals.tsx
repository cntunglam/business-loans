import { ReactNode, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useModals = <T extends string>(
  entryId: string,
  modals: Record<T, (onClose: () => void) => ReactNode>,
  onClose?: () => void
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentModal = searchParams.get('id') === entryId ? searchParams.get('modal') : undefined;

  const closeModal = useCallback(() => {
    setSearchParams((searchParams) => {
      searchParams.delete('modal');
      searchParams.delete('id');
      return searchParams;
    });
    onClose?.();
  }, [onClose, setSearchParams]);

  const openModal = useCallback(
    (modalType: T) => {
      setSearchParams((searchParams) => {
        searchParams.set('modal', modalType);
        searchParams.set('id', entryId);
        return searchParams;
      });
    },
    [entryId, setSearchParams]
  );

  const renderModal = () => {
    if (!currentModal) return null;
    const modal = modals[currentModal as keyof typeof modals];
    if (!modal) return null;
    return modal(closeModal);
  };

  return { currentModal, closeModal, openModal, renderModal };
};
