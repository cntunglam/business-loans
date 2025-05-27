import { IconButton } from "@mui/joy";
import { SingpassData } from "@roshi/shared";
import { FC, useEffect, useState } from "react";
import { useViewSingpassData } from "../../api/useLoanRequestApi";
import EyeIcon from "../icons/eyeIcon";
import { SingpassInfoModal } from "../shared/singpassInfoModal";

interface Props {
  loanRequestId: string;
}

export const SingpassButton: FC<Props> = ({ loanRequestId }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailSingpassData, setDetailSingpassData] = useState<SingpassData>();

  const { data, refetch } = useViewSingpassData(loanRequestId, {
    enabled: false,
  });

  useEffect(() => {
    if (data) {
      setDetailSingpassData(data?.data?.singpassData as SingpassData);
    }
  }, [data]);

  const handleOpenSingpassInfoModal = async () => {
    await refetch();
    setModalOpen(true);
  };

  return (
    <>
      {modalOpen && <SingpassInfoModal singpassData={detailSingpassData} onClose={() => setModalOpen(false)} />}
      <IconButton onClick={handleOpenSingpassInfoModal}>
        <EyeIcon color={"danger"} />
      </IconButton>
    </>
  );
};
