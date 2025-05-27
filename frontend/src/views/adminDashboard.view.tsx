import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { UserRoleEnum } from "@roshi/shared";
import { useSearchParams } from "react-router-dom";
import { AppLogsTable } from "../components/adminDashboard/appLogsTable";
import { AppointmentsTable } from "../components/adminDashboard/appointmentsTable";
import { ClosedLeadsTable } from "../components/adminDashboard/closedLeadsTable";
import { CompaniesTable } from "../components/adminDashboard/companiesTable";
import { LeadsTable } from "../components/adminDashboard/leadsTable/leadsTable";
import { UsersTable } from "../components/adminDashboard/usersTable";
import { Flex } from "../components/shared/flex";
import { useUserContext } from "../context/userContext";

export const AdminDashboardView = () => {
  const { isSuperAdmin, user } = useUserContext();
  const [params, setParams] = useSearchParams();

  const tab = params.get("tab") || "leads";

  const setTab = (val: string) => {
    const next = new URLSearchParams(params);
    next.set("tab", val);
    if (val !== "appointments") {
      next.delete("subtab");
    } else {
      next.set("subtab", "today");
    }
    setParams(next);
  };

  return (
    <Flex y grow fullwidth>
      <Tabs value={tab} onChange={(_, val) => val && setTab(val.toString())}>
        <TabList sx={{ flexWrap: "wrap" }}>
          <Tab value="leads">Lead Tracker</Tab>
          <Tab value="appointments">Appointments</Tab>
          <Tab value="closed">Closed</Tab>
          {user?.role === UserRoleEnum.ADMIN && <Tab value="companies">companies</Tab>}
          {isSuperAdmin && <Tab value="users">users</Tab>}
          {isSuperAdmin && <Tab value="Logs">Logs</Tab>}
        </TabList>
        <TabPanel value="leads">
          <LeadsTable />
        </TabPanel>
        <TabPanel value="companies">
          <CompaniesTable />
        </TabPanel>
        <TabPanel value="users">
          <UsersTable />
        </TabPanel>
        <TabPanel value="Logs">
          <AppLogsTable />
        </TabPanel>
        <TabPanel value="appointments">
          <AppointmentsTable />
        </TabPanel>
        <TabPanel value="closed">
          <ClosedLeadsTable />
        </TabPanel>
      </Tabs>
    </Flex>
  );
};
