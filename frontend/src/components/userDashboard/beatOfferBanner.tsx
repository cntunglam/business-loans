import { Box, Link, Typography } from "@mui/joy";
import { ASSETS } from "../../data/assets";
import { CONSTANTS } from "../../data/constants";
import { generateWhatsappLinkForUser } from "../../utils/utils";
import { Flex } from "../shared/flex";

export const BeatOfferBanner = () => {
  return (
    <>
      <Flex x gap1 yc my={2} p={1} borderRadius={"md"} sx={{ background: "white", boxShadow: "md" }}>
        <Box display={{ xs: "none", md: "block" }}>
          <img src={ASSETS.PERSON_RUSHING} height="65px" width="65px" />
        </Box>
        <Flex y ml={1}>
          <Flex x yc gap1>
            <Box display={{ xs: "block", md: "none" }}>
              <img src={ASSETS.PERSON_RUSHING} height="28px" width="28px" />
            </Box>
            <Typography fontWeight={800} textColor={"secondary.500"} level="title-md">
              Found a Better Rate? We'll Beat it!
            </Typography>
          </Flex>
          <Typography level="body-xs">
            We're so confident in our competitive rates that if you bring us a valid loan offer from another platform,
            we won't just match it – we'll beat it! That's our Price Beat Guarantee.{" "}
          </Typography>
        </Flex>
        <Flex x yc xc sx={{ width: { xs: undefined, md: "200px" } }}>
          <Link
            color="neutral"
            component="a"
            href={generateWhatsappLinkForUser(
              CONSTANTS.WA_PHONE_NUMBER,
              "Hi, I'm interested in the Price Beat Guarantee offer"
            )}
          >
            <Typography level="body-sm" sx={{ textDecoration: "underline" }}>
              Share offer
            </Typography>
          </Link>
        </Flex>
      </Flex>
    </>
  );
};
