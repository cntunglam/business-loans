import SvgIcon, { SvgIconProps } from "@mui/joy/SvgIcon";
import React from "react";

const EyeIcon: React.FC<SvgIconProps> = ({ ...props }) => (
  <SvgIcon {...props}>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.6849 8.99998C11.6849 10.485 10.4849 11.685 8.99988 11.685C7.51488 11.685 6.31488 10.485 6.31488 8.99998C6.31488 7.51498 7.51488 6.31498 8.99988 6.31498C10.4849 6.31498 11.6849 7.51498 11.6849 8.99998Z"
        stroke={"currentColor"}
        fill-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M8.99988 15.2025C11.6474 15.2025 14.1149 13.6425 15.8324 10.9425C16.5074 9.88498 16.5074 8.10748 15.8324 7.04998C14.1149 4.34998 11.6474 2.78998 8.99988 2.78998C6.35238 2.78998 3.88488 4.34998 2.16738 7.04998C1.49238 8.10748 1.49238 9.88498 2.16738 10.9425C3.88488 13.6425 6.35238 15.2025 8.99988 15.2025Z"
        stroke={"currentColor"}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </SvgIcon>
);

export default EyeIcon;
