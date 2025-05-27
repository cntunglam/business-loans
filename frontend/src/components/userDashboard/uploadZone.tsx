import { Card, CircularProgress, Typography } from "@mui/joy";
import { FC, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ASSETS } from "../../data/assets";
import { Flex } from "../shared/flex";
import useMediaQueries from "../../hooks/useMediaQueries";

interface Props {
  onSuccess: (file: File) => void;
  isLoading?: boolean;
}

export const UploadZone: FC<Props> = ({ onSuccess, isLoading }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onSuccess(acceptedFiles[0]);
    },
    [onSuccess]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpeg", ".jpg"], "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const isMobile = useMediaQueries(["sm"]);
  return (
    <Flex
      y
      yc
      xc
      pointer
      minHeight={"50px"}
      component={Card}
      {...getRootProps()}
      sx={{ border: "1px dashed rgba(234, 234, 234, 1)", backgroundColor: "neutral.50" }}
    >
      {isLoading ? (
        <CircularProgress size="sm" />
      ) : (
        <>
          <input {...getInputProps()} />
          <Typography level="body-lg" gap={1} startDecorator={<img src={ASSETS.UPLOAD} />}>
            {!isMobile.sm ? "Upload files" : "Select or drop files"}
          </Typography>
        </>
      )}
    </Flex>
  );
};
