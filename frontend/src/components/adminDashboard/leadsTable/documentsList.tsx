import { CheckCircle } from "@mui/icons-material";
import { Typography } from "@mui/joy";
import {
  DocumentTypeEnum,
  DocumentTypeEnumLabels,
  DocumentVerificationStatusEnum,
  DocumentVerificationStatusEnumColors,
  DocumentVerificationStatusEnumLabels,
  Prisma,
} from "@roshi/shared";
import { FC } from "react";
import { Flex } from "../../shared/flex";
import { ViewDocumentBtn } from "../../shared/viewDocumentBtn";

interface Props {
  documents: Prisma.DocumentGetPayload<true>[];
  onDelete?: (id: string) => void;
}
export const DocumentsList: FC<Props> = ({ documents }) => {
  return (
    <>
      {Object.keys(DocumentTypeEnum).map((docType) => {
        const doc = documents?.find((doc) => doc.documentType === docType);
        return (
          <ViewDocumentBtn filename={doc?.filename || ""}>
            <Flex
              key={doc?.filename}
              x
              py={1.5}
              px={1}
              rowGap={1}
              fullwidth
              growChildren
              sx={{ flexDirection: { xs: "column", md: "row" }, height: "50px" }}
            >
              <Flex gap1 x yc xsb px={{ xs: 1, md: 2 }} sx={{ "&>button": { padding: 0 } }}>
                <Typography
                  startDecorator={<CheckCircle sx={{ color: doc?.filename ? "success.400" : "neutral.400" }} />}
                  level="body-lg"
                  sx={{ gap: 1 }}
                >
                  {DocumentTypeEnumLabels[docType as DocumentTypeEnum]}
                </Typography>
                <Flex gap1 height={36} y yc>
                  {
                    <Typography
                      color={
                        DocumentVerificationStatusEnumColors[
                          doc ? (doc.humanVerificationStatus as DocumentVerificationStatusEnum) : "MISSING"
                        ]
                      }
                    >
                      {!doc
                        ? "Missing"
                        : DocumentVerificationStatusEnumLabels[
                            doc.humanVerificationStatus as DocumentVerificationStatusEnum
                          ] || ""}
                    </Typography>
                  }
                </Flex>
              </Flex>
            </Flex>
          </ViewDocumentBtn>
        );
      })}
    </>
  );
};
