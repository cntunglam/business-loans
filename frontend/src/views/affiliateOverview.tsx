import { Close } from "@mui/icons-material";
import { Box, Button, Drawer } from "@mui/material";
import { useState } from "react";
import { ReferralLink, useGetReferralLinks } from "../api/useAffiliateApi";
import { CreateReferralLink } from "../components/affiliateDashboard/createReferralLink";
import { GlobalStat } from "../components/affiliateDashboard/globalStat";
import { ReferralLinkTable } from "../components/affiliateDashboard/referralLinkTable";
import { Flex } from "../components/shared/flex";

export const AffiliateOverviewView = () => {
  const [openAddReferralLinkDrawer, setOpenAddReferralLinkDrawer] = useState(false);
  const [search, setSearch] = useState("");

  const { data: referralLinks, refetch } = useGetReferralLinks(search);
  const handleDrawerContentClose = () => {
    setOpenAddReferralLinkDrawer(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    refetch();
  };

  return (
    <Flex fullwidth y xst px={{ xs: 1, md: 4 }} pb={8}>
      <GlobalStat referralLinks={referralLinks as ReferralLink[]} />
      <Flex sx={{ mt: { xs: 2, md: 4 } }} y fullwidth>
        <ReferralLinkTable
          onAddReferralLink={() => setOpenAddReferralLinkDrawer(true)}
          referralLinks={referralLinks as ReferralLink[]}
          refetch={refetch}
          handleSearch={handleSearch}
          search={search}
        />

        <Drawer open={openAddReferralLinkDrawer} onClose={handleDrawerContentClose} anchor="right" size="lg">
          <Button
            variant="plain"
            color="neutral"
            onClick={handleDrawerContentClose}
            sx={{ position: "absolute", top: 20, right: 0 }}
          >
            <Close />
          </Button>
          <Box px={2}>
            <CreateReferralLink
              onSuccess={() => {
                setOpenAddReferralLinkDrawer(false);
                refetch();
              }}
            />
          </Box>
        </Drawer>
      </Flex>
    </Flex>
  );
};
