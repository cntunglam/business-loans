import { HomeOutlined, Logout } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Divider,
  Dropdown,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  Tab,
  TabList,
  Tabs,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { useUserContext } from "../../context/userContext";
import CalendarTickIcon from "../icons/calendarTickIcon";
import SearchIcon from "../icons/searchIcon";
import SettingsIcon from "../icons/settingsIcon";
import XIcon from "../icons/xIcon";
import { AppointmentScheduled } from "../lenderDashboard/AppointmentScheduled";
import { Flex } from "../shared/flex";
import { RoshiLogo } from "../shared/roshiLogo";

export const LenderLayout = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchedId = searchParams.get("loanRequest");
  const [showSearch, setShow] = useState<boolean>(!!searchedId);
  const { user, logout } = useUserContext();
  const navigate = useNavigate();

  const [scheduled, setScheduled] = useState(false);

  useEffect(() => {
    if (!showSearch && !!searchedId) {
      setShow(true);
    }
  }, [searchedId, showSearch]);

  const renderTabs = () => (
    <Tabs
      // If user has searched something, he/she will be on all tab
      value={searchedId ? "all" : searchParams.get("tab") || "new"}
      onChange={(_, newTab) => {
        setSearchParams({ tab: newTab?.toString() || "new" });
      }}
      sx={{ width: "100%" }}
    >
      <TabList
        variant="plain"
        sx={{
          height: { xs: "40px", md: "62px" },
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          whiteSpace: "nowrap",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <Tab value="new" sx={{ flex: "0 0 auto" }}>
          New
        </Tab>
        <Tab value="approved" sx={{ flex: "0 0 auto" }}>
          Given Offer
        </Tab>
        <Tab value="rejected" sx={{ flex: "0 0 auto" }}>
          Given Rejection
        </Tab>
        {/* All tab will only display when user is searching something */}
        {searchedId && (
          <Tab value="all" sx={{ flex: "0 0 auto" }}>
            All
          </Tab>
        )}
        <Tab value="offer-accepted" sx={{ flex: "0 0 auto" }}>
          Offer Accepted
        </Tab>
        <Tab value="closed" sx={{ flex: "0 0 auto" }}>
          Approved
        </Tab>
      </TabList>
    </Tabs>
  );

  const handleSearchToggle = () => {
    setShow((prev) => {
      if (prev) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("loanRequest", "");
        setSearchParams(newParams);
      }
      return !prev;
    });
  };

  const handleClear = () => {
    setShow(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("loanRequest");
    setSearchParams(newParams);
  };
  return (
    <Flex grow y>
      <Flex x xsb yc px={2} fullwidth>
        <RoshiLogo height="48px" sx={{ py: 1, display: { xs: "none", md: "block" } }} />
        <RoshiLogo height="48px" smallLogo sx={{ py: 1, display: { xs: "block", md: "none" } }} />
        <Box display={{ xs: "none", md: "flex" }} height="62px">
          {location.pathname === "/lender/dashboard" && renderTabs()}
        </Box>
        {scheduled && <AppointmentScheduled onClose={() => setScheduled(false)} />}
        <Flex x gap={1}>
          <IconButton
            sx={{ display: { xs: "flex", md: "none" }, background: "white", padding: "10px 5px" }}
            onClick={handleSearchToggle}
          >
            <SearchIcon />
          </IconButton>
          <Box
            sx={{ display: { xs: "flex", md: "none" }, background: "white", padding: "10px 5px" }}
            onClick={() => {
              setScheduled(true);
            }}
          >
            <CalendarTickIcon />
          </Box>
          <Flex x yc gap2>
            <Dropdown>
              <MenuButton slots={{ root: IconButton }} slotProps={{ root: { variant: "plain", color: "neutral" } }}>
                <Avatar src={user?.company?.logo} sx={{ cursor: "pointer" }} />
              </MenuButton>
              <Menu placement="bottom-end">
                <MenuItem>
                  <Flex x yc gap={1}>
                    <Flex>
                      <Avatar src={user?.company?.logo} />
                    </Flex>
                    <Flex y>
                      <Typography level="title-sm">{user?.name}</Typography>
                      <Typography level="body-sm">{user?.email}</Typography>
                    </Flex>
                  </Flex>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => navigate("/lender/dashboard")}>
                  <HomeOutlined sx={{ mr: 1 }} /> <Typography level="body-sm">Dashboard</Typography>
                </MenuItem>
                <MenuItem onClick={() => navigate("/lender/settings")}>
                  <SettingsIcon sx={{ mr: 1 }} /> <Typography level="body-sm">Settings</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => logout?.()} color="danger">
                  <Logout sx={{ mr: 1 }} /> <Typography level="body-sm">Logout</Typography>
                </MenuItem>
              </Menu>
            </Dropdown>
          </Flex>
        </Flex>
      </Flex>
      {(location.pathname == "/lender/dashboard" || showSearch) && (
        <Box display={{ xs: "block", md: "none" }} overflow="auto" height="40px">
          {showSearch ? (
            <Flex x yc gap={2} px={2}>
              <Input
                fullWidth
                value={searchParams.get("loanRequest") || ""}
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set("loanRequest", e.target.value);
                  setSearchParams(newParams);
                }}
                placeholder="Find application by ID"
              />
              <IconButton onClick={handleClear}>
                <XIcon />
              </IconButton>
            </Flex>
          ) : (
            location.pathname === "/lender/dashboard" && renderTabs()
          )}
        </Box>
      )}
      <Divider />
      <Outlet />
    </Flex>
  );
};
