import SvgIcon, { SvgIconProps } from '@mui/joy/SvgIcon';
import React from 'react';

const CheckedCheckBoxCircle: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12.293" cy="12.0396" r="11.5" fill="#E9FFF5" stroke="currentColor" />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M18.7141 8.67626L10.9759 17.5199L7.07031 13.6143L8.01828 12.6664L10.9106 15.5587L17.7052 7.79346L18.7141 8.67626Z"
        fill="currentColor"
      />
    </svg>
  </SvgIcon>
);

export default CheckedCheckBoxCircle;
