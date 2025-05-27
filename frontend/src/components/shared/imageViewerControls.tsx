import { Restore, ZoomIn, ZoomOut } from "@mui/icons-material";
import { Button } from "@mui/joy";
import { useControls } from "react-zoom-pan-pinch";
import { Flex } from "./flex";

export const ImageViewerControls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <Flex x xc yc gap2 sx={{ position: "absolute", top: 5, zIndex: 4, left: "50%", transform: "translateX(-50%)" }}>
      <Button variant="soft" color="neutral" sx={{ width: "50px" }} onClick={() => zoomIn()}>
        <ZoomIn sx={{ fontSize: "2rem" }} />
      </Button>
      <Button variant="soft" color="neutral" sx={{ width: "50px" }} onClick={() => zoomOut()}>
        <ZoomOut sx={{ fontSize: "2rem" }} />
      </Button>
      <Button variant="soft" color="neutral" sx={{ width: "50px" }} onClick={() => resetTransform()}>
        <Restore sx={{ fontSize: "2rem" }} />
      </Button>
    </Flex>
  );
};
