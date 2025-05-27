import { ChatBubbleOutline } from "@mui/icons-material";
import { Box, Button, Divider, Dropdown, Menu, MenuButton, MenuItem } from "@mui/joy";
import { FC } from "react";
import { Link, Outlet } from "react-router-dom";
import { useUserContext } from "../../context/userContext";
import useMediaQueries from "../../hooks/useMediaQueries";
import { Flex } from "../shared/flex";
import { RoshiLogo } from "../shared/roshiLogo";

export const AdminLayout: FC = () => {
  const { user, logout } = useUserContext();
  const { sm } = useMediaQueries(["sm"]);
  return (
    <Flex grow y>
      <Flex x xsb yc px={2} py={1} fullwidth wrap>
        <Flex x gap3 wrap>
          <RoshiLogo
            smallLogo={!sm}
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", md: "center" },
              alignItems: "center",
            }}
          />
          <Button color="neutral" component={Link} variant="outlined" to="/admin/dashboard">
            Dashboard
          </Button>
          <Button color="neutral" component={Link} to="/admin/chat" variant="outlined">
            <ChatBubbleOutline />
          </Button>
        </Flex>
        <Dropdown>
          <MenuButton>
            <Box sx={{ display: { xs: "none", md: "block" } }}>{user?.email}</Box>
            <Box sx={{ display: { xs: "block", md: "none" } }}>{user?.email?.charAt(0)}</Box>
          </MenuButton>

          <Menu placement="bottom-end">
            <MenuItem onClick={() => logout?.()}>Logout</MenuItem>
          </Menu>
        </Dropdown>
      </Flex>
      <Divider />
      <Outlet />
    </Flex>
  );
};
