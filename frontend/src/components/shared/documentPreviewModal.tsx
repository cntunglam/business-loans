import { ArrowLeft, ArrowRight, Close } from "@mui/icons-material";
import { Box, Button, CircularProgress, IconButton } from "@mui/joy";
import { FC, ReactNode, useEffect, useRef } from "react";
import { ImageViewer } from "./imageViewer";

interface Props {
  url: string;
  filename: string;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  bottomSlot?: ReactNode;
  isLoading?: boolean;
}

export const DocumentPreviewModal: FC<Props> = ({
  url,
  filename,
  onClose,
  onNext,
  onPrevious,
  bottomSlot,
  isLoading,
}) => {
  const embedRef = useRef<HTMLEmbedElement>(null);
  // const [zoomed, setZoomed] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    const embedElement = embedRef.current;
    document.addEventListener("keydown", handleKeyDown);
    embedElement?.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      embedElement?.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 10,
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.7)",
      }}
    >
      <IconButton sx={{ zIndex: 3, position: "absolute", top: 10, right: 10 }} onClick={() => onClose()}>
        <Close htmlColor="white" />
      </IconButton>
      {isLoading || !url ? (
        <CircularProgress />
      ) : filename.endsWith(".pdf") ? (
        <Box sx={{ height: "100vh", width: "100vw" }}>
          <embed
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onClose();
              }
            }}
            src={url}
            style={{
              zIndex: 3,
              objectFit: "cover",
              marginTop: "50px",
              paddingBottom: "50px",
              width: "100%",
              height: "calc(100% - 50px)",
            }}
          />
        </Box>
      ) : (
        <ImageViewer src={url} />
      )}
      {onNext && (
        <Button
          variant="soft"
          color="neutral"
          sx={{ position: "absolute", bottom: 10, right: 10, zIndex: 4 }}
          onClick={() => onNext()}
        >
          <ArrowRight />
        </Button>
      )}
      {onPrevious && (
        <Button
          variant="soft"
          color="neutral"
          sx={{ position: "absolute", bottom: 10, left: 10, zIndex: 4 }}
          onClick={() => onPrevious()}
        >
          <ArrowLeft />
        </Button>
      )}
      <Box sx={{ position: "absolute", bottom: 10, zIndex: 4 }}>{bottomSlot}</Box>
    </Box>
  );
};
