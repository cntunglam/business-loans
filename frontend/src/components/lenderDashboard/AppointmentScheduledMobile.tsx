import { Box } from "@mui/joy";
import { FC } from "react";
import { Flex } from "../shared/flex";
import type { ScheduleDay } from "./AppointmentScheduled";

interface Props {
  scheduleData: ScheduleDay[];
  selectedDay?: ScheduleDay;
  setSelectedDay: (day: ScheduleDay) => void;
}

export const AppointmentScheduledMobile: FC<Props> = ({ selectedDay, setSelectedDay, scheduleData }) => {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "common.white",
        boxShadow: "0px 4px 8px 0px #2B070814",
        display: { xs: "block", md: "none" },
        borderRadius: "6px",
      }}
    >
      <Box
        sx={{ display: "flex", justifyContent: "space-between", background: "#F9F4FF", borderRadius: "6px 6px 0 0px" }}
      >
        {scheduleData?.map((day) => (
          <Box
            sx={{
              padding: "10px",
              border: selectedDay?.date === day.date ? "2px solid #4F2B72" : "",
              background: new Date().getDate().toString() === day.date ? "#4F2B72" : "",
              color: new Date().getDate().toString() === day.date ? "#ffffff" : "",
              borderRadius: "4px",
              textAlign: "center",
              cursor: "pointer",
            }}
            key={day.date}
            className={`tab ${selectedDay?.date === day.date ? "active" : ""}`}
            onClick={() => setSelectedDay(day)}
          >
            <Box sx={{ color: new Date().getDate().toString() === day.date ? "#ffffff" : "#7B7B7B", fontSize: "14px" }}>
              {day.day.slice(0, 3)}
            </Box>
            <Box sx={{ fontSize: "14px" }}>{day.date}</Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ padding: "10px", height: "250px", overflow: "scroll" }}>
        {selectedDay?.slots?.length === 0 && (
          <div className="appointment-item">
            <span className="time">No appointments scheduled for this day.</span>
          </div>
        )}
        {selectedDay?.slots?.map((slot, index) => (
          <Flex gap1 key={index} className="appointment-item">
            <span className="time">{slot.time}</span>
            <span className="name">{slot.name}</span>
          </Flex>
        ))}
      </Box>
    </Box>
  );
};
