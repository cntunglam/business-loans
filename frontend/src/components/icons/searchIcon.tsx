import SvgIcon, { SvgIconProps } from '@mui/joy/SvgIcon';
import React from 'react';

const SearchIcon: React.FC<SvgIconProps> = ({ ...props }) => (
  <SvgIcon {...props}>
    <svg width="10" height="10" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16.5 16.5L12.75 12.75M13.5 7.5C13.5 10.8137 10.8137 13.5 7.5 13.5C4.18629 13.5 1.5 10.8137 1.5 7.5C1.5 4.18629 4.18629 1.5 7.5 1.5C10.8137 1.5 13.5 4.18629 13.5 7.5Z"
        stroke={'currentColor'}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </SvgIcon>
);

export default SearchIcon;
