import SvgIcon, { SvgIconProps } from '@mui/joy/SvgIcon';
import React from 'react';

const EditPencilIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.3335 2.33331H7.00016C3.66683 2.33331 2.3335 3.66664 2.3335 6.99997V11C2.3335 14.3333 3.66683 15.6666 7.00016 15.6666H11.0002C14.3335 15.6666 15.6668 14.3333 15.6668 11V9.66664M10.9402 3.76668C11.3868 5.36002 12.6335 6.60668 14.2335 7.06002M11.6935 3.01326L6.44014 8.26659C6.24014 8.46659 6.04014 8.85992 6.00014 9.14659L5.71347 11.1533C5.6068 11.8799 6.12014 12.3866 6.8468 12.2866L8.85347 11.9999C9.13347 11.9599 9.5268 11.7599 9.73347 11.5599L14.9868 6.30659C15.8935 5.39992 16.3201 4.34659 14.9868 3.01326C13.6535 1.67992 12.6001 2.10659 11.6935 3.01326Z"
        stroke="#25282B"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </SvgIcon>
);

export default EditPencilIcon;
