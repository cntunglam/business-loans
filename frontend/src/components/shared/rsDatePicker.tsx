import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { IconButton, Option, Select, Typography } from "@mui/joy";
import { FC } from "react";
import DatePicker, { DatePickerProps } from "react-datepicker";
import { Flex } from "./flex";

type RsDatePickerProps = DatePickerProps & {
  isTimeSelected: "date" | "time";
};

export const RsDatePicker: FC<RsDatePickerProps> = ({ isTimeSelected, ...props }) => {
  return (
    <Flex
      x
      xc
      fullwidth
      sx={{
        ".react-datepicker-popper": {
          transform: "none !important",
          position: "unset !important",
          willChange: "auto !important",
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
        ".react-datepicker__input-container": { display: "none" },
        ".react-datepicker__triangle": { display: "none" },
        ".react-datepicker__day": {
          fontSize: "16px",
          minWidth: { xs: "40px", md: "55px" },
          py: { xs: 1, md: 1.5 },
          borderRadius: "md",
        },
        ".react-datepicker__day-name": {
          fontSize: "16px",
          color: "neutral.400",
          minWidth: { xs: "40px", md: "55px" },
        },

        ".react-datepicker__month-container": {
          boxShadow: "md",
          width: "100% !important",
          padding: "0 20px !important",
          display: { xs: isTimeSelected === "date" ? "block" : "none", sm: "block" },
        },
        ".react-datepicker__tab-loop": {},
        ".react-datepicker__header": {
          backgroundColor: "white",
          minHeight: "60px !important",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderBottom: "none",
        },
        ".react-datepicker__day--keyboard-selected, .react-datepicker__month-text--keyboard-selected, .react-datepicker__quarter-text--keyboard-selected, .react-datepicker__year-text--keyboard-selected":
        {
          backgroundColor: "secondary.500",
          color: "white",
        },
        ".react-datepicker__day--selected": {
          backgroundColor: "secondary.500",
          color: "white",
        },
        ".react-datepicker__navigation-icon--next::before": {
          borderColor: "secondary.500",
        },
        ".react-datepicker__navigation-icon--previous::before": {
          borderColor: "secondary.500",
        },
        ".react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box": {
          width: "100% !important",
        },
        "h2.react-datepicker__current-month": {
          fontSize: "20px",
          color: "neutral.500",
          my: "10px",
        },
        ".react-datepicker-time__header": {
          fontSize: "20px !important",
          color: "neutral.500",
          fontWeight: "700 !important",
        },
        ".react-datepicker__time-container ": {
          borderLeftColor: "neutral.50",
          boxShadow: "md",
          // width: "100% !important",
          width: { xs: "375px !important", sm: "100% !important" },

          overflowY: "visible !important",
          padding: "0 20px !important",
          display: { xs: isTimeSelected !== "date" ? "block" : "none", sm: "block" },
        },
        ".react-datepicker__time-list": {
          width: "100% !important",
          height: { xs: "150px", sm: "auto" },
        },
        ".react-datepicker__time-list::-webkit-scrollbar": {
          display: "none",
        },
        ".react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item":
        {
          borderRadius: "md",
          fontSize: "16px",
          px: 4,
          py: 1,
          my: 2,
          height: "auto !important",
          width: "inset !important",
        },
        ".react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover":
        {
          backgroundColor: "secondary.500",
          color: "white",
        },
        ".react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected":
        {
          color: "white",
          backgroundColor: "secondary.500",
          borderRadius: "md !important",
          width: "auto !important",
        },
        // ".react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--disabled":
        //   {
        //     display: "none",
        //   },
      }}
    >
      <DatePicker
        timeFormat="HH:mm"
        {...props}
        showDateSelect={true}
        renderCustomHeader={({ date, decreaseMonth, increaseMonth, changeYear }) => {
          const currentYear = date.getFullYear();
          const years = Array.from({ length: props.yearDropdownItemNumber || 100 }, (_, i) => new Date().getFullYear() - i);
          return (
            <Flex x xc yc gap2 fullwidth py={1}>
              <IconButton size="sm" onClick={decreaseMonth}>
                <ChevronLeft fontSize="small" />
              </IconButton>
              <Typography level="h4" color="neutral" fontWeight={"700"}>
                {date.toLocaleDateString("en-GB", { year: "numeric", month: "long" })}
              </Typography>

              {props.showYearDropdown && <Select
                value={currentYear}
                onChange={(_, val) => changeYear(val || currentYear)}
              >
                {years.map((year) => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>}

              <IconButton size="sm" onClick={increaseMonth}>
                <ChevronRight fontSize="small" />
              </IconButton>
            </Flex>
          )
        }}
      />
    </Flex>
  );
};
