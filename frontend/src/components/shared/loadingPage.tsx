import CircularProgress from "@mui/joy/CircularProgress";
import Typography from "@mui/joy/Typography";
import { FC } from "react";
import { Flex } from "./flex";

interface Props {
  minHeight?: string;
  variant?: "overlay";
  isLoading?: boolean;
  opacity?: number;
  message?: string;
  messageColor?: string;
  messageSize?: string;
}

export const LoadingPage: FC<Props> = ({
  minHeight,
  variant,
  isLoading = true,
  opacity = 0.7,
  message,
  messageColor = "inherit",
  messageSize = "sm",
}) => {
  if (variant === "overlay" && !isLoading) return null;

  const LoadingContent = () => (
    <>
      <CircularProgress />
      {message && (
        <Typography
          level="body-sm"
          sx={{
            color: messageColor,
            fontSize: messageSize,
            mt: 2,
            textAlign: "center",
          }}
        >
          {message}
        </Typography>
      )}
    </>
  );

  if (variant === "overlay") {
    return (
      <Flex
        y
        yc
        xc
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 5,
          background: `rgba(255, 255, 255, ${opacity})`,
        }}
      >
        <LoadingContent />
      </Flex>
    );
  }

  return (
    <Flex y yc xc grow minHeight={minHeight}>
      <LoadingContent />
    </Flex>
  );
};
