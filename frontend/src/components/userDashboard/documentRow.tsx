import { CheckCircle } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/joy";
import { DocumentTypeEnum } from "@roshi/shared";
import { FC, useMemo } from "react";
import { toast } from "react-toastify";
import { useDeleteDocument, useUploadDocument } from "../../api/useDocumentApi";
import { ASSETS } from "../../data/assets";
import { Flex } from "../shared/flex";
import { ViewDocumentBtn } from "../shared/viewDocumentBtn";
import { UploadZone } from "./uploadZone";

interface DocumentInfo {
  docType: DocumentTypeEnum;
  label: string;
  description?: string;
  optional?: boolean;
}

interface Props extends Omit<DocumentInfo, 'docType'> {
  documentType: DocumentTypeEnum;
  applicantId?: string;
  documents?: { filename: string; documentType: DocumentTypeEnum | string }[];
  height?: string;
  refetch: () => void;
}

export const DocumentUploadRow: FC<Props> = ({ 
  label, 
  documentType, 
  documents, 
  applicantId, 
  refetch, 
  height, 
  description,
  optional = false 
}) => {
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();

  const handleUpload = async (file: File, documentType: DocumentTypeEnum) => {
    if (!applicantId) {
      toast.error("No application data found");
      return;
    }

    await uploadDocument.mutateAsync({ applicantInfoId: applicantId, file, documentType }).then(() => {
      toast.success("Document uploaded successfully");
      refetch();
    });
  };
  const handleDeleteDoc = async (filename: string) => {
    await deleteDocument.mutateAsync(filename).then(() => {
      toast.success("Document deleted successfully");
      refetch();
    });
  };

  const filename = useMemo(() => {
    return documents?.find((doc) => doc.documentType === documentType)?.filename;
  }, [documents, documentType]);

  return (
    <Flex
      key={filename}
      x
      py={!filename ? 1 : 1.5}
      px={1}
      rowGap={1}
      fullwidth
      growChildren
      sx={{ 
        flexDirection: { xs: "column", md: "row" }, 
        height: height,
        border: '1px solid',
        borderColor: 'neutral.200',
        borderRadius: 'md',
        backgroundColor: 'neutral.50',
        '&:hover': {
          backgroundColor: 'neutral.100',
        },
        transition: 'background-color 0.2s ease-in-out',
      }}
    >
      <Flex y gap={0.5} px={{ xs: 1, md: 2 }} flex={1}>
        <Flex x yc gap={1}>
          <CheckCircle sx={{ color: filename ? "success.400" : "neutral.400", flexShrink: 0, mt: 0.5 }} />
          <Flex y>
            <Typography level="body-lg">
              {label}
              {optional && (
                <Typography component="span" level="body-sm" color="neutral" ml={1}>
                  (Optional)
                </Typography>
              )}
            </Typography>
            {description && (
              <Typography level="body-sm" color="neutral">
                {description}
              </Typography>
            )}
          </Flex>
        </Flex>
        <Flex gap1>
          {filename && <ViewDocumentBtn filename={filename} />}
          {filename && (
            <IconButton
              variant="plain"
              color="neutral"
              loading={deleteDocument.isPending}
              onClick={() => handleDeleteDoc(filename)}
            >
              <img src={ASSETS.TRASH} height={"24px"} />
            </IconButton>
          )}
        </Flex>
      </Flex>
      {!filename && (
        <UploadZone isLoading={uploadDocument.isPending} onSuccess={(file) => handleUpload(file, documentType)} />
      )}
    </Flex>
  );
};
