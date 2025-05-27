import { Tooltip, TooltipProps } from "@mui/joy";
import { FC, useState } from "react";

export const RsTooltip: FC<TooltipProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Tooltip
      {...props}
      open={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      onClick={() => setIsOpen((open) => !open)}
    />
  );
};
