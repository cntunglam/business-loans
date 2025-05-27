import { Box, Button, Divider, Link, List, ListItem, Typography } from "@mui/material";
import { LoanRequestTypeEnum } from "@roshi/shared";
import { useUserContext } from "../../../context/userContext";
import { ASSETS } from "../../../data/assets";
import { TEST_IDS } from '../../../utils/testUtils';
import { Flex } from "../../shared/flex";
import { FlexGrid } from "../../shared/flexGrid";
import { ApplyIcon } from './applyIcon';

interface Props {
  onClose: () => void;
  loanRequestType: LoanRequestTypeEnum;
}

export const ApplyModal = ({ onClose, loanRequestType }: Props) => {
  const { user } = useUserContext();

  const renderBulletList = (items: string[]) => (
    <List sx={{ listStyleType: "disc", pl: 2, py: 1 }}>
      {items.map((item, index) => (
        <ListItem key={index} sx={{ display: "list-item", p: 0, pl: 1, color: "#000" }}>
          <Typography fontSize="sm">{item}</Typography>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ p: 3, width: { xs: "100%", sm: "600px" } }}>
      <Typography level="h4" fontWeight={700} textAlign="center" mb={3}>
        Apply for a {loanRequestType === LoanRequestTypeEnum.ZERO_INTEREST ? "0% Interest" : "Personal"} Loan
      </Typography>
      
      <FlexGrid container spacing={3}>
        <FlexGrid xs={12} sm={5.5} y xc sx={{ mb: { xs: 4, sm: 0 } }}>
          <ApplyIcon image={ASSETS.STANDARD_LOAN} />
          <Box>
            <Typography level="body-lg" fontWeight={"bold"} textAlign={"center"} color="secondary" py={1.25}>
              Standard Application
            </Typography>
            {renderBulletList([
              "Quick Application Process",
              "Competitive Interest Rates",
              "Flexible Repayment Options"
            ])}
          </Box>
          <Button
            variant="outlined"
            color="secondary"
            data-testid={TEST_IDS.manualApplicationButton}
            sx={{ fontWeight: "800", mt: 2.5 }}
            onClick={() => onClose()}
          >
            Apply Now
          </Button>
        </FlexGrid>
      </FlexGrid>
      
      <Divider sx={{ my: 3 }} />
      
      {!user && (
        <Flex y xc yc>
          <Typography>
            Already applied?{" "}
            <Link component="a" href="/signin" sx={{ fontWeight: "700 !important" }}>
              Login here
            </Link>
          </Typography>
        </Flex>
      )}
    </Box>
  );
};
