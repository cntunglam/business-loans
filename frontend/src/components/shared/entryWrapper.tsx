import { Box } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";
import { ElementType, FC } from "react";
import { useInView } from "react-intersection-observer";

export interface EntryWrapperProps {
  height: number; // used for lazy rendering
  sx?: SxProps;
  wrapperComponent?: ElementType;
  render: () => React.ReactNode;
}

export const EntryWrapper: FC<EntryWrapperProps> = ({ render, wrapperComponent, height, sx, ...rest }) => {
  const { ref, inView } = useInView();
  return (
    <Box
      ref={ref}
      component={wrapperComponent}
      sx={{
        ...sx,
        height,
      }}
      {...rest}
    >
      {inView && render()}
    </Box>
  );
};
