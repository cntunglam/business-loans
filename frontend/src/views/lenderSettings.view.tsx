import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useGetCompanyNotificationSettings } from "../api/useCompanyApi";
import { ApiTokenSettings } from "../components/lenderSettings/apiTokenSettings";
import { LenderFilterSettings } from "../components/lenderSettings/leanderLeadSettings";
import { LenderNotificationSettings } from "../components/lenderSettings/lenderNotificationSettings";
import { LenderPreferenceSettings } from "../components/lenderSettings/lenderPreferenceSettings";
import { Flex } from "../components/shared/flex";
import { LoadingPage } from "../components/shared/loadingPage";

export const LenderSettingsView = () => {
  const {
    data: notificationSettings,
    isFetchedAfterMount,
    refetch: refetchNotifSettings,
  } = useGetCompanyNotificationSettings();

  return (
    <Flex y fullwidth grow>
      <Tabs defaultValue={"lead-settings"}>
        <TabList>
          <Tab value="lead-settings">Lead Settings</Tab>
          <Tab value="notifications">Notifications</Tab>
          <Tab value="api">API</Tab>
          <Tab value="preferences">Preferences</Tab>
        </TabList>
        <TabPanel value="notifications">
          {isFetchedAfterMount ? (
            <LenderNotificationSettings
              notificationSettings={notificationSettings || undefined}
              refetch={refetchNotifSettings}
            />
          ) : (
            <LoadingPage variant="overlay" />
          )}
        </TabPanel>
        <TabPanel value="api">
          <ApiTokenSettings />
        </TabPanel>
        <TabPanel value="lead-settings">
          <LenderFilterSettings />
        </TabPanel>
        <TabPanel value="preferences">
          <LenderPreferenceSettings />
        </TabPanel>
      </Tabs>
    </Flex>
  );
};
