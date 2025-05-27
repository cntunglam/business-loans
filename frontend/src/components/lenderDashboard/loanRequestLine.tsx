import { Divider, Typography } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";
import { ReactNode } from "react";
import { Flex } from "../shared/flex";

export const LoanRequestLine = ({
  children,
  bold,
  noBorder,
  sx,
}: {
  children: ReactNode;
  bold?: boolean;
  noBorder?: boolean;
  sx?: SxProps;
}) => {
  return (
    <Flex y>
      <Typography
        sx={{
          my: 1.5,
          mx: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          whiteSpace: "nowrap",
          height: "30px",
          ...sx,
        }}
        fontWeight={bold ? "600" : undefined}
      >
        {children}
      </Typography>
      {!noBorder && <Divider />}
    </Flex>
  );
};
