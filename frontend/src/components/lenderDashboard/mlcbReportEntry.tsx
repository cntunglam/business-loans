import { Grid, styled, Typography } from "@mui/joy";
import { MLCBLoanSchema } from "@roshi/backend";
import { z } from "zod";
import { Flex } from "../shared/flex";

interface Props {
  entry: z.infer<typeof MLCBLoanSchema>;
}

const StyledGrid = styled(Grid)(({ theme }) => ({
  border: "1px solid " + theme.palette.background.level3,
  backgroundColor: theme.palette.background.level2,
}));

export const MlcbReportEntry = ({ entry }: Props) => {
  return (
    <StyledGrid container spacing={1} sx={{ minWidth: "800px" }}>
      <StyledGrid xs={4}>
        <Typography fontWeight={800}>Date</Typography>
      </StyledGrid>
      <StyledGrid xs={8}>
        <Typography>{entry.LOANDATE}</Typography>
      </StyledGrid>
      <StyledGrid xs={4}>
        <Typography fontWeight={800}>Amount</Typography>
      </StyledGrid>
      <StyledGrid xs={8}>
        <Typography>${entry.TOTPAYAMT}</Typography>
      </StyledGrid>
      {entry.CYCLE.map((item) => (
        <StyledGrid fontWeight={800} xs={1}>
          <Flex y xc yc>
            <Flex>{item.MONTH}</Flex>
            <Flex>{item.YEAR}</Flex>
          </Flex>
        </StyledGrid>
      ))}
      {entry.CYCLE.map((item) => (
        <StyledGrid xs={1}>
          <Flex x yc xc>
            {typeof item.STATUS === "object" ? "-" : item.STATUS}
          </Flex>
        </StyledGrid>
      ))}
    </StyledGrid>
  );
};
