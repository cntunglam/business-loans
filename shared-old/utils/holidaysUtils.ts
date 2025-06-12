import { isSameDay } from "date-fns";

const holidays = [
  { date: new Date(2024, 0, 1), name: "New Year's Day" },
  { date: new Date(2024, 1, 10), name: "Chinese New Year" },
  { date: new Date(2024, 1, 11), name: "Chinese New Year" },
  { date: new Date(2024, 2, 29), name: "Good Friday" },
  { date: new Date(2024, 3, 10), name: "Hari Raya Puasa" },
  { date: new Date(2024, 4, 1), name: "Labour Day" },
  { date: new Date(2024, 4, 22), name: "Vesak Day" },
  { date: new Date(2024, 5, 17), name: "Hari Raya Haji" },
  { date: new Date(2024, 7, 9), name: "National Day" },
  { date: new Date(2024, 9, 31), name: "Deepavali" },
  { date: new Date(2024, 11, 25), name: "Christmas Day" },
  { date: new Date(2025, 0, 1), name: "New Year’s Day" },
  { date: new Date(2025, 0, 29), name: "Chinese New Year" },
  { date: new Date(2025, 0, 30), name: "Chinese New Year" },
  { date: new Date(2025, 2, 31), name: "Hari Raya Puasa" },
  { date: new Date(2025, 3, 18), name: "Good Friday" },
  { date: new Date(2025, 4, 1), name: "Labour Day" },
  { date: new Date(2025, 4, 12), name: "Vesak Day" },
  { date: new Date(2025, 5, 7), name: "Hari Raya Haji" },
  { date: new Date(2025, 7, 9), name: "National Day" },
  { date: new Date(2025, 9, 20), name: "Deepavali" },
  { date: new Date(2025, 11, 25), name: "Christmas Day" },
];

export const isHoliday = (date: Date) => {
  return holidays.some((holiday) => isSameDay(date, holiday.date));
};
