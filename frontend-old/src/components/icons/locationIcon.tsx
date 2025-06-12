import SvgIcon, { SvgIconProps } from '@mui/joy/SvgIcon';
import React from 'react';

const LocationIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.99978 10.0725C10.2921 10.0725 11.3398 9.02485 11.3398 7.7325C11.3398 6.44016 10.2921 5.3925 8.99978 5.3925C7.70744 5.3925 6.65978 6.44016 6.65978 7.7325C6.65978 9.02485 7.70744 10.0725 8.99978 10.0725Z"
        stroke="#25282B"
      />
      <path
        d="M2.71478 6.3675C4.19228 -0.127499 13.8148 -0.119998 15.2848 6.375C16.1473 10.185 13.7773 13.41 11.6998 15.405C10.1923 16.86 7.80728 16.86 6.29228 15.405C4.22228 13.41 1.85228 10.1775 2.71478 6.3675Z"
        stroke="#25282B"
      />
    </svg>
  </SvgIcon>
);

export default LocationIcon;
