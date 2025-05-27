import SvgIcon, { SvgIconProps } from "@mui/joy/SvgIcon";
import React from "react";

const SingPassVerifiedIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M16.9813 8.86567C16.9813 13.3478 13.3478 16.9813 8.86567 16.9813C4.38351 16.9813 0.75 13.3478 0.75 8.86567C0.75 4.38351 4.38351 0.75 8.86567 0.75C11.0968 0.75 13.1177 1.65035 14.5848 3.10756C12.1717 4.90439 10.5567 7.40379 9.38971 9.20973C9.10501 9.65032 8.84698 10.0496 8.61054 10.3874L6.96973 7.53768L7.4124 7.34403H3.70732C5.12756 10.8608 7.79334 13.5435 8.94869 14.4452C10.6385 10.3222 15.537 4.13879 17.7368 1.43109C17.7386 1.42948 17.7404 1.42789 17.7422 1.42631C17.3108 2.13079 16.3745 3.86101 16.0806 5.14599C16.6563 6.26027 16.9813 7.52501 16.9813 8.86567Z"
        fill="#1AC577"
      />
    </svg>
  </SvgIcon>
);

export default SingPassVerifiedIcon;
