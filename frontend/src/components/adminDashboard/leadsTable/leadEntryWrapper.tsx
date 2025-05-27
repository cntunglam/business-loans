import { Box } from "@mui/joy";
import { FC } from "react";
import { useInView } from "react-intersection-observer";
import { LeadEntry, LeadEntryProps } from "./leadEntry";

export const LeadEntryWrapper: FC<LeadEntryProps> = (props) => {
  const { ref, inView } = useInView();
  return (
    <Box ref={ref} component={"tr"} sx={{ height: "50px", "& td": { lineHeight: "20px" } }}>
      {inView && <LeadEntry {...props} />}
    </Box>
  );
};
