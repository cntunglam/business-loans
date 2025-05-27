import { Button, Typography } from "@mui/joy";
import { Link } from "react-router-dom";
import { useContactBorrower } from "../../api/useLoanResponseApi";
import { generateWhatsappLinkForUser } from "../../utils/utils";
import { Flex } from "../shared/flex";
import { LoadingPage } from "../shared/loadingPage";
import { RsModal } from "../shared/rsModal";

export const ContactInformationModal = ({
  loanResponseId,
  onClose,
}: {
  loanResponseId: string;
  onClose: () => void;
}) => {
  const { data, isLoading } = useContactBorrower(loanResponseId);
  return (
    <RsModal title="Contact information" onClose={onClose} sx={{ minWidth: "unset", width: "500px" }}>
      {!data ? (
        <LoadingPage isLoading={isLoading} variant="overlay" />
      ) : (
        <Flex y gap1>
          <Flex x xsb>
            <Typography fontWeight={"600"}>Name</Typography>
            <Typography>{data.data.fullname}</Typography>
          </Flex>
          <Flex x xsb>
            <Typography fontWeight={"600"}>Phone number</Typography>
            <Typography>{data.data.phoneNumber}</Typography>
          </Flex>
          {data.data.phoneNumber && (
            <Button
              component={Link}
              to={generateWhatsappLinkForUser(data.data.phoneNumber)}
              size="sm"
              sx={{ padding: "10px 25px", fontSize: "16px" }}
            >
              Open in whatsapp
            </Button>
          )}
        </Flex>
      )}
    </RsModal>
  );
};
