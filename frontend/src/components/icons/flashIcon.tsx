import SvgIcon, { SvgIconProps } from "@mui/joy/SvgIcon";
import React from "react";

const FlashIcon: React.FC<SvgIconProps> = ({ ...props }) => (
  <SvgIcon {...props}>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.375 2.99998H1.125M5.625 15H1.125M3.375 8.99998H1.125M6.99 9.95998H9.30749V15.36C9.30749 16.155 10.2975 16.53 10.8225 15.93L16.5 9.47998C16.995 8.91748 16.5975 8.03998 15.8475 8.03998H13.53V2.63998C13.53 1.84498 12.54 1.46998 12.015 2.06998L6.3375 8.51998C5.85 9.08248 6.2475 9.95998 6.99 9.95998Z"
        stroke={"currentColor"} // Custom color handling via props
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </SvgIcon>
);

export default FlashIcon;
