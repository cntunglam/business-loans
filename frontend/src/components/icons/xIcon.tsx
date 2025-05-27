import SvgIcon, { SvgIconProps } from "@mui/joy/SvgIcon";
import React from "react";

const XIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.75 14.25L14.25 3.75M14.25 14.25L3.75 3.75"
        stroke="#25282B"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </SvgIcon>
);

export default XIcon;
