import { CopyAll } from "@mui/icons-material";
import { Link } from "@mui/joy";
import { shortId } from "@roshi/shared";
import { toast } from "react-toastify";
import { Flex } from "./flex";

export const ShortId = ({ id, onClick }: { id: string; onClick?: () => void }) => {
  return (
    <Flex x yc gap1>
      <CopyAll
        sx={{ fontSize: "1rem", cursor: "pointer", ":hover": { color: "primary.500" } }}
        onClick={() => {
          navigator.clipboard.writeText(id);
          toast.success("ID copied to clipboard");
        }}
      />
      {onClick ? (
        <Link color="neutral" onClick={onClick}>
          {shortId(id)}
        </Link>
      ) : (
        <>{shortId(id)}</>
      )}
    </Flex>
  );
};
