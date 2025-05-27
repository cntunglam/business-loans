import SvgIcon, { SvgIconProps } from "@mui/joy/SvgIcon";
import React from "react";

const StarIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.5833 3.04203L9.9583 5.81287L13 6.25037C13.5416 6.3337 13.7708 7.00037 13.375 7.3962L11.1666 9.5212L11.6875 12.542C11.7708 13.0837 11.2083 13.5004 10.7083 13.2504L7.99997 11.8337L5.2708 13.2712C4.7708 13.5212 4.2083 13.1045 4.29164 12.5629L4.81247 9.54203L2.60414 7.3962C2.2083 7.00037 2.43747 6.3337 2.97914 6.25037L6.0208 5.81287L7.3958 3.04203C7.6458 2.54203 8.35414 2.56287 8.5833 3.04203Z"
        fill="currentColor"
      />
    </svg>
  </SvgIcon>
);

export default StarIcon;
