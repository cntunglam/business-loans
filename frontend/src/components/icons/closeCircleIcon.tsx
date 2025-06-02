import SvgIcon, { SvgIconProps } from '@mui/joy/SvgIcon';
import React from 'react';

const CloseCircleIcon: React.FC<SvgIconProps> = ({ ...props }) => (
  <SvgIcon {...props}>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.87753 11.1225L11.1225 6.87749M11.1225 11.1225L6.87753 6.87749M9 16.5C13.125 16.5 16.5 13.125 16.5 9C16.5 4.875 13.125 1.5 9 1.5C4.875 1.5 1.5 4.875 1.5 9C1.5 13.125 4.875 16.5 9 16.5Z"
        stroke={'currentColor'}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </SvgIcon>
);

export default CloseCircleIcon;
