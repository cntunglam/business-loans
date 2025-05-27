import { IconButton } from "@mui/joy";
import { ReactNode, useState } from "react";
import { useGetDocumentLink } from "../../api/useDocumentApi";
import { ASSETS } from "../../data/assets";
import { DocumentPreviewModal } from "./documentPreviewModal";

export const ViewDocumentBtn = ({
  children,
  filename,
  openInModal,
}: {
  children?: ReactNode;
  filename: string;
  openInModal?: boolean;
}) => {
  const getDocumentLink = useGetDocumentLink();
  const [modalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState<string>();

  const displayDocument = async () => {
    const file = await handlePreviewDocument();
    if (openInModal) {
      setModalOpen(true);
    } else window.open(file, "_blank");
  };

  const handlePreviewDocument = async () => {
    if (file) return file;
    return await getDocumentLink.mutateAsync(filename).then((link) => {
      if (!link) return;
      setFile(link);
      return link;
    });
  };

  return (
    <>
      {modalOpen && file && <DocumentPreviewModal url={file} filename={filename} onClose={() => setModalOpen(false)} />}
      <IconButton
        size="sm"
        color="neutral"
        variant="plain"
        loading={getDocumentLink.isPending}
        onClick={() => displayDocument()}
      >
        {children ? children : <img src={ASSETS.VIEW} height={"24px"} />}
      </IconButton>
    </>
  );
};
