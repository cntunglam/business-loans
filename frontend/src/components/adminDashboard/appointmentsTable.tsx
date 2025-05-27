import { Tab, Table, TabList, Tabs } from "@mui/joy";
import { addHours, startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { useSearchParams } from "react-router-dom";
import { useGetAllAppointmentsAdmin } from "../../api/useAdminApi";
import { Flex } from "../shared/flex";
import { AppointmentEntry } from "./appointmentEntry";

export const AppointmentsTable = () => {
  const { data: appointments, refetch } = useGetAllAppointmentsAdmin();

  const [params, setParams] = useSearchParams();
  const tab = (params.get("subtab") || "today") as "past" | "today" | "upcoming";

  const setSubTab = (val: string) => {
    const next = new URLSearchParams(params);

    next.set("subtab", val);
    setParams(next);
  };

  // Define the timezone for Singapore
  const timeZone = "Asia/Ho_Chi_Minh";

  const filteredAppointments = appointments?.filter((appointment) => {
    if (!appointment.scheduledTime) return false;
    // 1. Get the current moment in time (as a UTC Date object).
    const nowUtc = new Date();

    // 2. Interpret the parsed naive date as being in the Singapore timezone
    //    and get the actual moment in time (as a UTC Date object).
    // const scheduledUtc = fromZonedTime(appointment.scheduledTime, timeZone);
    const offsetMinutes = toZonedTime(nowUtc, timeZone).getTimezoneOffset();
    const offsetHours = offsetMinutes / 60;
    const scheduledUtc = addHours(appointment.scheduledTime, offsetHours);

    // 3. Determine the start of "today" and "tomorrow" according to the Singapore timezone.
    //    Convert these boundaries to UTC Date objects for accurate comparison.
    const nowSgt = toZonedTime(nowUtc, timeZone); // Current time in SGT
    const startOfTodaySgt = startOfDay(nowSgt); // Start of today (00:00:00) in SGT
    const startOfTodayUtc = fromZonedTime(startOfTodaySgt, timeZone); // Convert start of today (SGT) back to UTC

    // 4. Calculate start of tomorrow (00:00:00) in SGT
    const startOfTomorrowSgt = new Date(startOfTodaySgt);
    startOfTomorrowSgt.setDate(startOfTomorrowSgt.getDate() + 1);
    const startOfTomorrowUtc = fromZonedTime(startOfTomorrowSgt, timeZone); // Convert start of tomorrow (SGT) back to UTC

    // 5. Compare the appointment's actual time (in UTC) against the SGT day boundaries (in UTC).
    switch (tab) {
      case "past":
        // Is the appointment time strictly before the start of today (in SGT)?
        return scheduledUtc.getTime() < startOfTodayUtc.getTime();
      case "today":
        // Is the appointment time on or after the start of today (SGT)
        // AND strictly before the start of tomorrow (SGT)?
        return (
          scheduledUtc.getTime() >= startOfTodayUtc.getTime() && scheduledUtc.getTime() < startOfTomorrowUtc.getTime()
        );
      case "upcoming":
        // Is the appointment time on or after the start of tomorrow (SGT)?
        return scheduledUtc.getTime() >= startOfTomorrowUtc.getTime();
      default:
        return false;
    }
  });

  return (
    <>
      <Tabs
        value={tab}
        onChange={(_, val) => val && setSubTab(val.toString())}
        sx={{ flexWrap: "wrap", mx: "calc(-1 * var(--Tabs-spacing))", mt: "calc(-0.5 * var(--Tabs-spacing))" }}
      >
        <TabList>
          <Tab value="past">Past</Tab>
          <Tab value="today">Today</Tab>
          <Tab value="upcoming">Upcoming</Tab>
        </TabList>
      </Tabs>

      <Flex sx={{ overflowX: "auto" }}>
        <Table>
          <thead>
            <tr>
              <th style={{ width: "120px" }}>Created On</th>
              <th style={{ width: "120px" }}>Name</th>
              <th style={{ width: "120px" }}>Phone</th>
              <th style={{ width: "120px" }}>Lender</th>
              <th style={{ width: "120px" }}>Location</th>
              <th style={{ width: "180px" }}>Appointment Date</th>
              <th style={{ width: "180px" }}>Customer Support</th>
              <th style={{ width: "120px" }}>Note</th>
              <th style={{ width: "120px" }}>Status</th>
              <th style={{ minWidth: "120px", width: "100%" }}>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {!filteredAppointments?.length && (
              <tr>
                <td colSpan={11}>No appointments found</td>
              </tr>
            )}
            {filteredAppointments?.map((appointment) => (
              <AppointmentEntry key={appointment.id} refetch={refetch} appointment={appointment} />
            ))}
          </tbody>
        </Table>
      </Flex>
    </>
  );
};
