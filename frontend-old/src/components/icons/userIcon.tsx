import SvgIcon, { SvgIconProps } from '@mui/joy/SvgIcon';
import React from 'react';

const UserIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.99601 8.22373C8.92101 8.21623 8.83101 8.21623 8.74851 8.22373C6.96351 8.16373 5.54601 6.70123 5.54601 4.90123C5.54601 3.06373 7.03101 1.57123 8.87601 1.57123C10.7135 1.57123 12.206 3.06373 12.206 4.90123C12.1985 6.70123 10.781 8.16373 8.99601 8.22373Z"
        stroke="#25282B"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M5.24602 10.9912C3.43102 12.2062 3.43102 14.1862 5.24602 15.3937C7.30852 16.7737 10.691 16.7737 12.7535 15.3937C14.5685 14.1787 14.5685 12.1987 12.7535 10.9912C10.6985 9.61873 7.31602 9.61873 5.24602 10.9912Z"
        stroke="#25282B"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </SvgIcon>
);

export default UserIcon;
