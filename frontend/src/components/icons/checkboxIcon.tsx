import SvgIcon, { SvgIconProps } from '@mui/joy/SvgIcon';
import React from 'react';

const CheckboxIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.75 16.5H11.25C15 16.5 16.5 15 16.5 11.25V6.75C16.5 3 15 1.5 11.25 1.5H6.75C3 1.5 1.5 3 1.5 6.75V11.25C1.5 15 3 16.5 6.75 16.5Z"
        stroke="#25282B"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M5 9L7.66353 12L13 6" stroke="#25282B" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </SvgIcon>
);

export default CheckboxIcon;
