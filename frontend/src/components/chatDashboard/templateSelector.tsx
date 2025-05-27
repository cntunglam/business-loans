import { FileCopy } from "@mui/icons-material";
import { Button } from "@mui/joy";
import { MessageTemplatesEnum } from "@roshi/shared";
import { useState } from "react";
import { useGetTemplate } from "../../api/useAdminApi";
import { RsModal } from "../shared/rsModal";

interface Props {
  setContent: (content: string) => void;
  isLoading: boolean;
  loanRequestId: string;
}

const availableTemplates = [MessageTemplatesEnum.CIMB_OFFER, MessageTemplatesEnum.FEEDBACK] as const;

export const TemplateSelector = ({ setContent, isLoading, loanRequestId }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const getTemplate = useGetTemplate();
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        color="neutral"
        variant="outlined"
        loading={isLoading || getTemplate.isPending}
      >
        <FileCopy />
      </Button>
      {isOpen && (
        <RsModal title="Select template" onClose={() => setIsOpen(false)}>
          {availableTemplates.map((template) => (
            <Button
              variant="outlined"
              color="neutral"
              key={template}
              onClick={() => {
                setIsOpen(false);
                getTemplate.mutateAsync({ template, loanRequestId }).then((res) => setContent(res.data));
              }}
            >
              {template}
            </Button>
          ))}
        </RsModal>
      )}
    </>
  );
};
