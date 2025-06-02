import SvgIcon, { SvgIconProps } from '@mui/joy/SvgIcon';
import React from 'react';

const LogoutIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.675 5.66999C6.9075 2.96999 8.295 1.86749 11.3325 1.86749H11.43C14.7825 1.86749 16.125 3.20999 16.125 6.56249V11.4525C16.125 14.805 14.7825 16.1475 11.43 16.1475H11.3325C8.3175 16.1475 6.93 15.06 6.6825 12.405M1.5 8.99999H11.16M9.4875 6.48749L12 8.99999L9.4875 11.5125"
        stroke="#25282B"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </SvgIcon>
);

export default LogoutIcon;
