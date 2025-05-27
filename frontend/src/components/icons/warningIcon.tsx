import SvgIcon, { SvgIconProps } from "@mui/joy/SvgIcon";
import React from "react";

const WarningIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.5 0.25C5.12391 0.25 0.75 4.62391 0.75 10C0.75 15.3761 5.12391 19.75 10.5 19.75C15.8761 19.75 20.25 15.3761 20.25 10C20.25 4.62391 15.8761 0.25 10.5 0.25ZM11.4375 15.2458H9.5625V13.3708H11.4375V15.2458ZM11.25 12.25H9.75L9.46875 4.75H11.5312L11.25 12.25Z"
        fill="currentColor"
      />
    </svg>
  </SvgIcon>
);

export default WarningIcon;
