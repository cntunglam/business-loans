import SvgIcon, { SvgIconProps } from "@mui/joy/SvgIcon";
import React from "react";

const MoneyIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.375 4.5H5.25C4.215 4.5 3.375 5.34 3.375 6.375V7.5M11.625 4.5H12.75C13.785 4.5 14.625 5.34 14.625 6.375V7.5M6.375 13.5H5.25C4.215 13.5 3.375 12.66 3.375 11.625V10.5M11.625 13.5H12.75C13.785 13.5 14.625 12.66 14.625 11.625V10.5M12.75 15.375H5.25C3 15.375 1.5 14.25 1.5 11.625V6.375C1.5 3.75 3 2.625 5.25 2.625H12.75C15 2.625 16.5 3.75 16.5 6.375V11.625C16.5 14.25 15 15.375 12.75 15.375ZM11.25 9C11.25 10.2426 10.2426 11.25 9 11.25C7.75736 11.25 6.75 10.2426 6.75 9C6.75 7.75736 7.75736 6.75 9 6.75C10.2426 6.75 11.25 7.75736 11.25 9Z"
        stroke="#25282B"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </SvgIcon>
);

export default MoneyIcon;
