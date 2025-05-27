import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, IconButton, Table, Typography } from "@mui/joy";
import { formatWithoutTz, LoanOffer } from "@roshi/shared";
import { FC, useState } from "react";
import DatePicker from "react-datepicker";
import { useGetScheduledAppointment } from "../../api/useAppointmentApi";
import { Flex } from "../shared/flex";
import { RsModal } from "../shared/rsModal";
import { AppointmentScheduledMobile } from "./AppointmentScheduledMobile";

interface Props {
  onClose: () => void;
  offer?: LoanOffer;
  isClosedDeal?: boolean;
}

export interface ScheduleDay {
  day: string;
  date: string;
  slots: {
    time: string;
    name: string;
  }[];
}

export const AppointmentScheduled: FC<Props> = ({ onClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data } = useGetScheduledAppointment({
    date: selectedDate
      ? new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())).toISOString()
      : new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())).toISOString(),
  });

  const scheduleData: ScheduleDay[] =
    data?.data?.data?.map((day) => ({
      day: day.dayOfWeekLocale,
      date: new Date(day.date).getDate().toString(),
      slots: day.appointments.map((appointment) => ({
        time: appointment.scheduledTime ? formatWithoutTz(appointment.scheduledTime, "HH:mm aa") : "",
        name: appointment.userName ?? "",
      })),
    })) || [];

  const [selectedDay, setSelectedDay] = useState<ScheduleDay | undefined>(scheduleData[0]);

  return (
    <RsModal title={"Appointments Schedule"} onClose={onClose}>
      <Flex y gap1 sx={{ minHeight: 360 }}>
        <Flex x xe yc>
          <Box
            sx={{
              ".react-datepicker__tab-loop": {
                position: "relative",
              },
              ".react-datepicker-popper": {
                willChange: "auto !important",
                border: "1px solid #DFDFDF",
                borderRadius: "0 0 6px 6px",
                left: { xs: "-83px !important", md: "-133px !important" },
              },
              ".react-datepicker": {
                borderColor: "neutral.50",
                borderRadius: "md",
                gap: 2,
                display: "flex",
                flexGrow: 1,
                flexDirection: { xs: "column", sm: "row" },
                fontFamily: "Proxima Nova",
              },
              ".react-datepicker__header": {
                backgroundColor: "white",
                minHeight: "50px !important",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                borderBottom: "none",
              },
              ".react-datepicker__day": {
                fontSize: "14px",
                minWidth: { xs: "30px", md: "55px" },
                py: "0.5rem !important",
                borderRadius: "md",
              },
              ".react-datepicker__day-name": {
                fontSize: "14px",
                color: "neutral.400",
                minWidth: { xs: "30px", md: "55px" },
              },
              ".react-datepicker__day--selected": {
                backgroundColor: "secondary.500",
                color: "white",
              },
              ".react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover":
                {
                  backgroundColor: "secondary.500",
                  color: "white",
                },
              ".react-datepicker-wrapper": { width: "100%" },
              ".react-datepicker__input-container": {
                width: "100%",
                input: {
                  width: "100%",
                  border: "1px solid #DFDFDF",
                  borderRadius: "4px",
                  padding: " 10px",
                },
              },
              "react-datepicker__input-container::placeholder": {
                fontSize: "14px !important",
              },
              ".react-datepicker-ignore-onclickoutside": {
                border: "1px solid #DFDFDF",
                borderRadius: "4px",
                padding: "8px 10px",
                width: "100%",
              },
              ".react-datepicker-ignore-onclickoutside::placeholder": { color: "#999999", fontSize: "14px " },

              ".react-datepicker__triangle": {
                display: "none",
              },
            }}
          >
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => setSelectedDate(date || new Date())}
              placeholderText="Select date"
              renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
                <Flex x xc yc gap2 fullwidth py={1}>
                  <IconButton size="sm" onClick={decreaseMonth}>
                    <ChevronLeft fontSize="small" />
                  </IconButton>
                  <Typography level="h4" color="neutral" fontWeight="700">
                    {date.toLocaleDateString("en-GB", { year: "numeric", month: "long" })}
                  </Typography>
                  <IconButton size="sm" onClick={increaseMonth}>
                    <ChevronRight fontSize="small" />
                  </IconButton>
                </Flex>
              )}
            />
          </Box>
        </Flex>
        <AppointmentScheduledMobile
          selectedDay={selectedDay}
          setSelectedDay={(day) => setSelectedDay(day)}
          scheduleData={scheduleData}
        />
        <Box sx={{ minHeight: { sm: "0" } }}>
          <Table
            sx={{
              borderBottom: "1px solid #DFDFDF",
              borderRadius: "6px",
              borderCollapse: "separate",
              borderSpacing: 0,
              display: { xs: "none", md: "block" },
            }}
          >
            <thead>
              <tr>
                {scheduleData.map((schedule: ScheduleDay) => (
                  <th
                    key={schedule.date}
                    style={{
                      border: "1px solid #DFDFDF",
                      background: "#F9F4FF",
                      textAlign: "center",
                      verticalAlign: "middle",
                      width: "135px",
                    }}
                  >
                    <Box>
                      <span style={{ color: "#7B7B7B" }}>{schedule.day}</span> {schedule.date}
                    </Box>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({
                length: Math.max(...scheduleData.map((d: ScheduleDay) => d.slots.length || 0)),
              }).length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <Typography textAlign={"center"}>No appointments scheduled for this week.</Typography>
                  </td>
                </tr>
              )}
              {Array.from({
                length: Math.max(...scheduleData.map((d: ScheduleDay) => d.slots.length || 0)),
              }).map((_, index) => (
                <tr key={index}>
                  {scheduleData.map((day: ScheduleDay, i: number) => (
                    <td
                      key={`${day.date}-${index}`}
                      style={{
                        textAlign: "center",
                        borderRight: i > 0 ? "1px solid #DFDFDF" : undefined,
                        borderLeft: "1px solid #DFDFDF",
                        borderBottom: "none",
                        padding: "8px",
                        verticalAlign: "middle",
                        width: "98px",
                      }}
                    >
                      {day.slots[index]?.time || "   "} {day.slots[index]?.name || "   "}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>
      </Flex>
    </RsModal>
  );
};
