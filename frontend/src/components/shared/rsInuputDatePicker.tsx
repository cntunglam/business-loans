import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/joy";
import { FC } from "react";
import DatePicker, { DatePickerProps } from "react-datepicker";
import { Flex } from "./flex";

type Props = {
  disableCustomHeader?: boolean;
} & DatePickerProps;

export const RsInputDatePicker: FC<Props> = (props) => {
  return (
    <Box
      sx={{
        zIndex: 2,
        ".react-datepicker": {
          borderColor: "neutral.50",
          borderRadius: "md",
          gap: 2,
          display: "flex",
          flexGrow: 1,
          flexDirection: { xs: "column", sm: "row" },
          fontFamily: "Proxima Nova",
        },
        ".react-datepicker__day": {
          fontSize: "14px",
          borderRadius: "md",
        },
        ".react-datepicker__day-name": {
          fontSize: "14px",
          color: "neutral.400",
        },

        ".react-datepicker__month-container": {
          boxShadow: "md",
          width: "100% !important",
          padding: "0 10px !important",
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
          width: "100% !important",
          overflowY: "visible !important",
          padding: "0 20px !important",
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
            fontSize: "14px",
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
        ".react-datepicker__day--range-start": {
          backgroundColor: "secondary.500",
        },
        ".react-datepicker__day--range-end": {
          backgroundColor: "secondary.500",
        },
      }}
    >
      <DatePicker
        {...props}
        renderCustomHeader={
          props.disableCustomHeader
            ? undefined
            : ({ monthDate, decreaseMonth, increaseMonth }) => {
                return (
                  <Flex x xc yc gap2 fullwidth py={1}>
                    <IconButton size="sm" onClick={decreaseMonth}>
                      <ChevronLeft fontSize="small" />
                    </IconButton>
                    <Typography fontSize={16} color="neutral" fontWeight={"700"}>
                      {monthDate.toLocaleDateString("en-GB", { year: "numeric", month: "long" })}
                    </Typography>
                    <IconButton size="sm" onClick={increaseMonth}>
                      <ChevronRight fontSize="small" />
                    </IconButton>
                  </Flex>
                );
              }
        }
      />
    </Box>
  );
};
