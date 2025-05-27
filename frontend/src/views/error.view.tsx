import { Link, Typography } from "@mui/joy";
import { ERROR_KEYS } from "@roshi/shared";
import { useParams } from "react-router-dom";
import { Flex } from "../components/shared/flex";
import { RoshiLogo } from "../components/shared/roshiLogo";
import { ERROR_CODE_TO_MESSAGE } from "../utils/errorHandler";

export const ErrorView = () => {
  const { code } = useParams();
  return (
    <Flex y grow xc yc gap1>
      <RoshiLogo />
      <Typography level="h4">
        {code && code in ERROR_CODE_TO_MESSAGE ? ERROR_CODE_TO_MESSAGE[code as ERROR_KEYS] : "Something went wrong"}
      </Typography>

      <Link href="/" color="neutral" sx={{ textDecoration: "underline" }}>
        Go back to home
      </Link>
    </Flex>
  );
};
