import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  Drawer,
  Dropdown,
  List,
  ListItemButton,
  ListItemDecorator,
  Menu,
  MenuButton,
  MenuItem,
  Typography,
  useTheme
} from '@mui/joy';
import { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useUserContext } from '../../context/userContext';
import { ASSETS } from '../../data/assets';
import { ApplicationDetailsView } from '../../views/applicationDetails.view';
import DetailIcon from '../icons/detailIcon';
import DocumentIcon from '../icons/documentIcon';
import HomeIcon from '../icons/homeIcon';
import LogoutIcon from '../icons/logoutIcon';
import PaymentTrackerIcon from '../icons/paymentTrackerIcon';
import RewardIcon from '../icons/rewardIcon';
import { Flex } from '../shared/flex';
import { RoshiLogo } from '../shared/roshiLogo';

export const UserLayout: FC = () => {
  const { t } = useTranslation();

  const primaryNavItems = [
    { label: t('form:layout.overview'), href: '/user/dashboard', icon: HomeIcon },
    // { label: t("layout.myApplication"), href: "/user/my-application", icon: CreditCard },
    { label: t('form:layout.documents'), href: '/user/documents', icon: DocumentIcon },
    { label: t('form:layout.details'), href: '', icon: DetailIcon, drawerContent: <ApplicationDetailsView />, search: 'details=true' },
    { label: t('form:layout.paymentTracker'), href: '/user/payment-tracker', icon: PaymentTrackerIcon, disabled: true },
    { label: t('form:layout.rewards'), href: '/user/rewards-and-vouchers', icon: RewardIcon, disabled: true }
  ];

  const footerNavItems: typeof primaryNavItems = [
    // { label: "Help & Support", href: "/user/help-support", icon: HelpAndSupportIcon },
    // { label: "Settings", href: "/user/settings", icon: SettingsIcon },
  ];

  const findActiveDrawerContent = (search: string) => {
    for (let index = 0; index < primaryNavItems.length; index++) {
      const item = primaryNavItems[index];
      if (item.search && search.includes(item.search)) {
        return item.drawerContent;
      }
    }
  };
  const { user, logout } = useUserContext();
  const theme = useTheme();
  const location = useLocation();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openContentDrawer, setOpenContentDrawer] = useState(false);
  const [drawerContent, setDrawerContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    const drawerContent = findActiveDrawerContent(location.search);
    if (drawerContent) {
      setOpenContentDrawer(true);
      setDrawerContent(drawerContent);
    } else {
      setOpenContentDrawer(false);
      setDrawerContent(null);
    }
  }, [location]);

  const getCurrentPath = useCallback(() => {
    return window.location.pathname + window.location.search;
  }, []);

  const getHref = useCallback((item: (typeof primaryNavItems)[number]) => {
    return item.href || getCurrentPath() + (item?.search ? (getCurrentPath().includes('?') ? `&${item.search}` : `?${item.search}`) : '');
  }, []);

  const handleDrawerContentClose = () => {
    setOpenContentDrawer(false);
    setDrawerContent(null);
    const drawerContent = findActiveDrawerContent(location.search);
    if (drawerContent) {
      if (document.referrer && new URL(document.referrer).origin === window.location.origin) {
        window.history.back();
      } else {
        const url = new URL(window.location.href);
        url.search = '';
        window.history.pushState({}, '', url);
      }
    }
  };

  const ListMenu = () => {
    return (
      <>
        <Flex y ysb sx={{ flexGrow: 1 }}>
          <List>
            {primaryNavItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <ListItemButton
                  disabled={item.disabled}
                  key={item.label}
                  component={Link}
                  to={getHref(item)}
                  sx={{ py: 2 }}
                  onClick={() => {
                    setOpenDrawer(false);
                  }}
                >
                  <ListItemDecorator>
                    <IconComponent
                      sx={{
                        color: item.disabled ? `${theme.palette.neutral[400]} !important` : `${theme.palette.secondary[500]} !important`
                      }}
                    />
                  </ListItemDecorator>
                  <Typography
                    sx={{
                      color: (theme) =>
                        item.disabled
                          ? `${theme.palette.neutral[400]} !important`
                          : location.pathname === item.href
                            ? `${theme.palette.primary[500]} !important`
                            : `${theme.palette.secondary[500]} !important`
                    }}
                    level="body-sm"
                  >
                    {item.label}
                  </Typography>
                </ListItemButton>
              );
            })}
          </List>
          <List sx={{ justifyContent: 'flex-end' }}>
            <Divider />
            {footerNavItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <ListItemButton key={item.label} component={Link} to={item.href} sx={{ py: 2 }} onClick={() => setOpenDrawer(false)}>
                  <ListItemDecorator>
                    <IconComponent
                      sx={{
                        color: `${theme.palette.secondary[500]} !important`
                      }}
                    />
                  </ListItemDecorator>
                  <Typography
                    sx={{
                      color: (theme) =>
                        location.pathname === item.href
                          ? `${theme.palette.primary[500]} !important`
                          : `${theme.palette.secondary[500]} !important`
                    }}
                    level="body-sm"
                  >
                    {item.label}
                  </Typography>
                </ListItemButton>
              );
            })}

            <ListItemButton sx={{ py: 2 }} onClick={() => logout?.()}>
              <ListItemDecorator>
                <LogoutIcon
                  sx={{
                    color: `${theme.palette.secondary[500]} !important`
                  }}
                />
              </ListItemDecorator>
              <Typography level="body-sm" sx={{ color: `${theme.palette.secondary[500]} !important` }}>
                {t('logout')}
              </Typography>
            </ListItemButton>
          </List>
        </Flex>
      </>
    );
  };
  return (
    <Flex x grow>
      <Flex
        y
        px={1}
        sx={{
          width: { md: '250px' },
          height: '100dvh',
          transition: 'width 0.5s',
          display: { xs: 'none', md: 'flex' },
          borderRight: '1px solid #E0D2ED',
          overflow: 'auto'
        }}
      >
        <RoshiLogo sx={{ display: { xs: 'none', md: 'flex' }, my: 4, justifyContent: 'center' }} height="40px" />
        <Flex y ysb sx={{ flexGrow: 1 }}>
          <ListMenu />
        </Flex>
      </Flex>
      <Flex
        y
        xc
        fullwidth
        gap={2}
        sx={{
          backgroundColor: (theme) => theme.palette.background.rsBackground,
          height: '100dvh',
          overflow: 'auto'
        }}
      >
        <Flex x xsb yc fullwidth px={1} pt={1}>
          <Flex
            x
            xc
            yc
            sx={{
              boxShadow: '0px 4px 50px 0px rgba(0, 0, 0, 0.03), 0px 5px 10px 0px rgba(0, 0, 0, 0.1)',
              borderRadius: '6px',
              display: { xs: 'block', md: 'none' }
            }}
          >
            <Button variant="plain" size="sm" onClick={() => setOpenDrawer(true)}>
              <img src={ASSETS.HAMBURGER_MENU} height={'20px'} />
            </Button>
            <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
              <Flex y sx={{ flexGrow: 1 }}>
                <ListMenu />
              </Flex>
            </Drawer>
          </Flex>

          <RoshiLogo sx={{ display: { xs: 'block', md: 'none' }, alignSelf: 'center' }} height="30px" />

          <Flex x xe py={1} sx={{ width: { xs: 'auto', md: '100%' } }}>
            <Flex fullwidth x xe>
              <Dropdown>
                <MenuButton variant="plain" sx={{ gap: 1, boxShadow: '0px 8px 16px 0px rgba(79, 43, 114, 0.1)', borderRadius: '6px' }}>
                  <img src={ASSETS.USER_CIRCLE} />
                  <Typography sx={{ display: { xs: 'none', md: 'block' } }} level="body-md" color="secondary">
                    {user?.email}
                  </Typography>
                </MenuButton>
                <Menu>
                  <MenuItem onClick={() => logout?.()}>{t('logout')}</MenuItem>
                </Menu>
              </Dropdown>
            </Flex>
          </Flex>
        </Flex>
        <Box width={'100%'}>
          <Outlet />
        </Box>
      </Flex>

      <Drawer open={openContentDrawer} onClose={handleDrawerContentClose} anchor="right" size="lg">
        <Button variant="plain" color="neutral" onClick={handleDrawerContentClose} sx={{ position: 'absolute', top: 20, right: 0 }}>
          <Close />
        </Button>
        <Box px={2}>{drawerContent}</Box>
      </Drawer>
    </Flex>
  );
};
