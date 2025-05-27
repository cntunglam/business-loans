import { Button } from "@mui/joy";
import { DocumentVerificationStatusEnum, Prisma } from "@roshi/shared";
import { FC, useEffect, useState } from "react";
import { useGetDocumentLink, useUpdateDocument } from "../../api/useDocumentApi";
import { DocumentPreviewModal } from "./documentPreviewModal";
import { Flex } from "./flex";

interface Props {
  documents: Prisma.DocumentGetPayload<true>[];
  onClose: () => void;
}
export const DocumentVerificationModal: FC<Props> = ({ documents, onClose }) => {
  const getDocumentLink = useGetDocumentLink();
  const [current, setCurrent] = useState(0);
  const [currentLink, setCurrentLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateDocument = useUpdateDocument();

  const getLink = async (filename: string) => {
    await getDocumentLink.mutateAsync(filename).then((link) => {
      if (!link) return;
      setCurrentLink(link);
    });
  };

  const handleNextDocument = async (valid: boolean) => {
    setIsLoading(true);
    await updateDocument.mutateAsync({
      filename: documents[current].filename,
      humanVerificationStatus: valid ? DocumentVerificationStatusEnum.VALID : DocumentVerificationStatusEnum.INVALID,
    });
    const next = current + 1;
    if (next >= documents.length) {
      onClose();
      return;
    }
    await getLink(documents[next].filename);
    setCurrent(next);
    setIsLoading(false);
  };

  // const nextOrPrev = async (next: boolean) => {
  //   setIsLoading(true);
  //   let newIndex = next ? current + 1 : current - 1;
  //   if (newIndex < 0) {
  //     newIndex = documents.length - 1;
  //   }
  //   if (newIndex >= documents.length) {
  //     newIndex = 0;
  //   }
  //   await getLink(documents[newIndex].filename);
  //   setCurrent(newIndex);
  //   setIsLoading(false);
  // };

  useEffect(() => {
    getLink(documents[0].filename);
  }, []);

  return (
    <>
      {/* <LoadingPage variant="overlay" isLoading={getDocumentLink.isPending} /> */}
      <DocumentPreviewModal
        url={currentLink}
        isLoading={isLoading}
        filename={documents[current].filename}
        onClose={onClose}
        // onNext={() => {
        //   nextOrPrev(true);
        // }}
        // onPrevious={() => {
        //   nextOrPrev(false);
        // }}
        bottomSlot={
          <Flex x xc gap3>
            <Button color="primary" onClick={() => handleNextDocument(true)}>
              Valid
            </Button>
            <Button color="danger" onClick={() => handleNextDocument(false)}>
              Invalid
            </Button>
          </Flex>
        }
      />
    </>
  );
};
