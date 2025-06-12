import SvgIcon, { SvgIconProps } from '@mui/joy/SvgIcon';
import React from 'react';

const NoteIcon: React.FC<SvgIconProps> = ({ ...props }) => (
  <SvgIcon {...props}>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" stroke={props.color || 'currentColor'}>
      <path
        d="M6 1.5V3.75M12 1.5V3.75M5.25 8.25H11.25M5.25 11.25H9M11.25 16.5H6.75C3 16.5 2.25 14.955 2.25 11.865V7.2375C2.25 3.7125 3.5025 2.7675 6 2.625H12C14.4975 2.76 15.75 3.7125 15.75 7.2375V12M11.25 16.5L15.75 12M11.25 16.5V14.25C11.25 12.75 12 12 13.5 12H15.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </SvgIcon>
);

export default NoteIcon;
