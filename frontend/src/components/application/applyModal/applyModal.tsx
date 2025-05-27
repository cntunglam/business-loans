import { Box, Button, Divider, Link, List, ListItem, Typography } from "@mui/material";
import { LoanRequestTypeEnum } from "@roshi/shared";
import { useSingpassLogin } from "../../../api/useSingpassApi";
import { useUserContext } from "../../../context/userContext";
import { ASSETS } from "../../../data/assets";
import { KEYS, TIME_CONSTANTS } from "../../../data/constants";
import { saveToLocalStorage } from "../../../utils/localStorageHelper";
import { TEST_IDS } from "../../../utils/testUtils";
import { GreenDot } from "../../../views/loanApplication.view";
import { Flex } from "../../shared/flex";
import { FlexGrid } from "../../shared/flexGrid";
import { RsModal } from "../../shared/rsModal";
import { ApplyIcon } from "./applyIcon";

interface Props {
  onClose: () => void;
  loanRequestType: LoanRequestTypeEnum;
  singpassOnly?: boolean;
}
export const ApplyModal = ({ onClose, loanRequestType, singpassOnly }: Props) => {
  const { user } = useUserContext();
  const singpassLogin = useSingpassLogin();

  const renderBulletList = (items: string[]) => {
    return (
      <List
        sx={{
          fontSize: "sm",
          borderRadius: 5,
          width: "100%",
          ml: "-50px",
          whiteSpace: "nowrap",
        }}
      >
        {items.map((i) => (
          <ListItem key={i}>
            <GreenDot />
            <Typography textColor="#000" fontSize="sm">
              {i}
            </Typography>
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <RsModal fullscreenOnMobile onClose={onClose} minWidth="700px" sx={{ pb: 3 }}>
      <FlexGrid
        container
        direction={{ xs: "column-reverse", sm: "row" }}
        justifyContent={"space-between"}
        mb={{ xs: 4, sm: 0 }}
      >
        {!singpassOnly && (
          <FlexGrid xs={12} sm={5.5} y mt={2.5} xc>
            <ApplyIcon image={ASSETS.STANDARD_LOAN} />
            <Box>
              <Typography level="body-lg" fontWeight={"bold"} textAlign={"center"} color="secondary" py={1.25}>
                Manual Application
              </Typography>
              {renderBulletList([
                "Flexible Document Submission",
                "Available to Non-Singpass Holders",
                "Highlight Supporting Info",
              ])}
            </Box>
            <Button
              size="lg"
              variant="outlined"
              color="secondary"
              data-testid={TEST_IDS.manualApplicationButton}
              sx={{ fontWeight: "800", mt: 2.5 }}
              onClick={() => onClose()}
            >
              Apply Now
            </Button>
          </FlexGrid>
        )}
        {!singpassOnly && <Divider sx={{ display: { xs: "none", sm: "block" } }} orientation="vertical" />}
        {!singpassOnly && <Divider sx={{ display: { xs: "block", sm: "none" } }} orientation="horizontal" />}
        <FlexGrid xs={12} sm={singpassOnly ? undefined : 5.5} mt={2.5} y xc sx={{ mb: { xs: 4, sm: 0 } }}>
          <ApplyIcon image={ASSETS.SINGPASS_LOGO} />
          <Box>
            <Typography level="body-lg" fontWeight={"bold"} textAlign={"center"} color="secondary" py={1.25}>
              Apply with Singpass
            </Typography>
            {singpassOnly ? (
              <Typography textColor="#000" fontSize="sm">
                To be eligible for the 0% interest loan, you must apply with Singpass.
              </Typography>
            ) : (
              renderBulletList(["Instant Loan Approvals", "Higher Loan Amounts", "Longer Loan Tenures"])
            )}
          </Box>
          <Button
            size="lg"
            sx={{ fontWeight: "800", mt: 2.5 }}
            onClick={() => {
              singpassLogin.mutateAsync().then((data) => {
                saveToLocalStorage(KEYS.SINGPASS_CODE_VERIFIER, data.codeVerifier, TIME_CONSTANTS.ONE_HOUR);
                saveToLocalStorage(KEYS.APPLICATION_LOAN_TYPE, loanRequestType, TIME_CONSTANTS.ONE_HOUR);
                window.location.assign(data.authorizeUrl);
              });
            }}
          >
            Apply Now
          </Button>
        </FlexGrid>
      </FlexGrid>
      <Divider sx={{ my: 3 }} />
      {!user && (
        <>
          <Flex y xc yc>
            <Typography>
              Already applied?{" "}
              <Link component="a" href="/signin" sx={{ fontWeight: "700 !important" }}>
                Login here
              </Link>
            </Typography>
          </Flex>
        </>
      )}
    </RsModal>
  );
};
