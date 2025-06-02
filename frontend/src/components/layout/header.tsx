import { Box, Dropdown, Link as JoyLink, Menu, MenuButton, MenuItem } from "@mui/joy";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import { useUserContext } from "../../context/userContext";
import useMediaQueries from "../../hooks/useMediaQueries";
import { Flex } from "../shared/flex";
import { RoshiLogo } from "../shared/roshiLogo";

export const Header = () => {
  const { t } = useTranslation();
  const { user, logout } = useUserContext();
  const { sm } = useMediaQueries(["sm"]);
  return (
    <Flex
      x
      xsb
      yc
      py={{ xs: 1, md: 2.3 }}
      px={{ xs: 3, md: 6 }}
      sx={{ borderBottom: "1px solid #E0E0E0" }}
      growChildren
    >
      <Box sx={{ visibility: { xs: "visible", sm: "hidden" } }}>
        <RoshiLogo
          smallLogo={!sm}
          sx={{
            display: "flex",
            justifyContent: { xs: "flex-start" },
            alignItems: "center",
          }}
        />
      </Box>
      <Box sx={{ visibility: { xs: "hidden", sm: "visible" } }}>
        <RoshiLogo
          smallLogo={!sm}
          sx={{
            display: "flex",
            justifyContent: { xs: "center" },
            alignItems: "center",
          }}
        />
      </Box>

      {!user ? (
        <Flex x xe>
          <JoyLink component={Link} color="secondary" to="/signin">
            {t("login")}
          </JoyLink>
        </Flex>
      ) : (
        <Flex x xe>
          <Dropdown>
            <MenuButton>{user.email}</MenuButton>
            <Menu>
              <MenuItem onClick={() => logout?.()}>{t("logout")}</MenuItem>
            </Menu>
          </Dropdown>
        </Flex>
      )}
    </Flex>
  );
};
