import { Box } from "@mui/material";

const AbsoluteStyles = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
};

interface Props {
  image: string;
}

export const ApplyIcon = ({ image }: Props) => {
  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative", minHeight: "150px" }}>
      <img
        src={image}
        alt="singpass"
        height="100%"
        width="100%"
        style={{
          maxHeight: "71px",
          maxWidth: "220px",
          objectFit: "contain",
          zIndex: 1,
          ...AbsoluteStyles,
        }}
      />
      <Box
        sx={{
          background: "#FBFBFB",
          height: 130,
          width: 130,
          borderRadius: "100%",
          zIndex: 0,
          ...AbsoluteStyles,
        }}
      />
    </Box>
  );
};
