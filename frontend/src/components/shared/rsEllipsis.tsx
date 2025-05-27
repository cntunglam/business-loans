import { Typography } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";
import { FC, ReactNode } from "react";
import { RsTooltip } from "./rsTooltip";

interface Props {
  children?: React.ReactNode;
  maxWidth?: string;
  maxLines?: number;
  sx?: SxProps;
  text: string | ReactNode;
  onClick?: () => void;
  endDecorator?: ReactNode;
}

export const RsEllipsis: FC<Props> = ({ text, maxWidth, maxLines, onClick, sx, endDecorator }) => {
  return (
    <RsTooltip title={text} sx={{ maxWidth: maxWidth }}>
      <Typography
        onClick={onClick}
        sx={{
          maxWidth: maxWidth,
          textOverflow: "ellipsis",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: maxLines || 1,
          ...sx,
        }}
      >
        {text}
        {endDecorator}
      </Typography>
    </RsTooltip>
  );
};
