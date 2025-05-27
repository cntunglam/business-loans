import { CopyAll } from "@mui/icons-material";
import { Button, Input, Typography } from "@mui/joy";
import { FC, useState } from "react";
import { toast } from "react-toastify";
import { useGenerateAPIToken } from "../../api/useTokenApi";
import { Flex } from "../shared/flex";
import { RsModal } from "../shared/rsModal";

interface Props {
  onClose: () => void;
  refetch: () => void;
}

export const GenerateApiTokenModal: FC<Props> = ({ onClose, refetch }) => {
  const [name, setName] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");
  const generateAPIToken = useGenerateAPIToken();

  return (
    <RsModal
      onClose={() => {
        onClose();
      }}
      title="Generate API token"
    >
      {generatedToken ? (
        <Flex y gap1>
          <Typography level="body-sm">Take not of your API token as it will not be displayed again</Typography>
          <Flex x yc gap2>
            <Input fullWidth value={generatedToken} readOnly />
            <Button
              size="sm"
              color="neutral"
              variant="outlined"
              onClick={() => {
                navigator.clipboard
                  .writeText(generatedToken)
                  .then(() => toast.success("Copied to clipboard"))
                  .catch(() => toast.error("Failed to copy to clipboard"));
              }}
            >
              <CopyAll />
            </Button>
          </Flex>
          <Button variant="soft" color="neutral" onClick={() => onClose()}>
            Close
          </Button>
        </Flex>
      ) : (
        <Flex y gap1>
          <Input placeholder="Give a name to your API token" value={name} onChange={(e) => setName(e.target.value)} />
          <Flex x yc gap1 fullwidth growChildren>
            <Button
              loading={generateAPIToken.isPending}
              onClick={() =>
                generateAPIToken.mutateAsync(name).then((res) => {
                  setGeneratedToken(res.data.token);
                  refetch();
                })
              }
            >
              Generate
            </Button>
          </Flex>
        </Flex>
      )}
    </RsModal>
  );
};
