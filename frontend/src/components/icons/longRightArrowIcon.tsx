import SvgIcon, { SvgIconProps } from "@mui/joy/SvgIcon";
import React from "react";

const LongRightArrowIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.8225 4.44751L15.375 9.00001L10.8225 13.5525M2.625 9.00001H15.2475"
        stroke="#25282B"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </SvgIcon>
);

export default LongRightArrowIcon;
