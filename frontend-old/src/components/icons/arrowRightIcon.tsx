import SvgIcon, { SvgIconProps } from '@mui/joy/SvgIcon';
import React from 'react';

const ArrowRightIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.93994 13.28L10.2866 8.93337C10.7999 8.42003 10.7999 7.58003 10.2866 7.0667L5.93994 2.72003"
        stroke="#25282B"
        stroke-width="1.5"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </SvgIcon>
);

export default ArrowRightIcon;
