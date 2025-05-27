import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, Button, Grid, IconButton, Input, Typography } from "@mui/joy";
import { LoanOffer } from "@roshi/shared";
import { FC, useState } from "react";
import DatePicker from "react-datepicker";
import { useCreateAppointment } from "../../api/useAppointmentApi";
import { useGetCompanyStores } from "../../api/useCompanyApi";
import { useGetMyLoanRequest } from "../../api/useLoanRequestApi";
import { Flex } from "../shared/flex";
import { LoadingPage } from "../shared/loadingPage";
import { RsModal } from "../shared/rsModal";

interface Props {
  onClose: () => void;
  offer?: LoanOffer;
  isClosedDeal?: boolean;
  loanResponse: NonNullable<ReturnType<typeof useGetMyLoanRequest>["data"]>["loanResponses"][0];
}

export const ScheduledAppointment: FC<Props> = ({ onClose, loanResponse }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { isLoading } = useGetCompanyStores(loanResponse?.lender?.id);
  const createAppointment = useCreateAppointment();

  return (
    <RsModal title={"Schedule an Appointment"} onClose={onClose}>
      {isLoading && <LoadingPage />}
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        <Grid xs={12} sm={6} md={6} lg={6}>
          <Box>
            <Input
              sx={{ marginY: "10px" }}
              fullWidth
              // value={searchParams.get("loanRequest") || ""}
              onChange={() => {
                // const newParams = new URLSearchParams(searchParams);
                // newParams.set("loanRequest", e.target.value);
                // setSearchParams(newParams);
              }}
              placeholder="Select time"
            />

            <Box
              sx={{
                ".react-datepicker-popper": {
                  transform: "translate(62px, 0px) !important",
                  position: "unset !important",
                  willChange: "auto !important",
                },
                ".react-datepicker__header": {
                  border: "none !important",
                  background: "none !important",
                },
                ".react-datepicker-wrapper": { width: "100%" },
                ".react-datepicker__input-container": {
                  width: "100%",
                  input: {
                    width: "100%", // Ensures the input element takes the full width of its container
                    border: "1px solid #DFDFDF",
                    borderRadius: "4px",
                    padding: " 10px",
                  },
                },
                ".react-datepicker-ignore-onclickoutside": {
                  border: "1px solid #DFDFDF",
                  borderRadius: "4px",
                  padding: "8px 10px",
                  width: "100%",
                },
                ".react-datepicker-ignore-onclickoutside::placeholder": { color: "#999999", fontSize: "14px" },

                ".react-datepicker__triangle": {
                  display: "none",
                },
              }}
            >
              <DatePicker
                // filterDate={(date) => {
                //   return data?.openingHours?.some((h) => h.isOpen && getDay(date) === h.dayOfWeek);
                // }}
                selected={selectedDate} // Bind to selectedDate state
                onChange={(date) => setSelectedDate(date)}
                timeFormat="HH:mm"
                // {...props}
                placeholderText="Select date"
                renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
                  <Flex x xc yc gap2 fullwidth py={1}>
                    <IconButton size="sm" onClick={decreaseMonth}>
                      <ChevronLeft fontSize="small" />
                    </IconButton>
                    <Typography level="h4" color="neutral" fontWeight={"700"}>
                      {date.toLocaleDateString("en-GB", { year: "numeric", month: "long" })}
                    </Typography>
                    <IconButton size="sm" onClick={increaseMonth}>
                      <ChevronRight fontSize="small" />
                    </IconButton>
                  </Flex>
                )}
              />
            </Box>
          </Box>
        </Grid>
        <Grid xs={12} sm={6} md={6} lg={6}>
          <Box
            sx={{
              boxShadow: "0px 4px 8px -3px #2B070814",
              padding: "10px",
            }}
          >
            <Typography sx={{ color: "#545454" }}>Abm Creditz - Chinatown</Typography>
            <Typography fontWeight={700} fontSize={"16px"} lineHeight={"24px"}>
              1 Park Rd, #01-12 People's Park Complex, Singapore 059108
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Button
        loading={createAppointment.isPending}
        size="lg"
        // onClick={() =>
        //   selectedDate &&
        //   createAppointment
        //     .mutateAsync({
        //       storeId: selected.id,
        //       scheduledTime: format(selectedDate, "yyyy-MM-dd'T'HH:mm':00Z'"),
        //       loanResponseId: loanResponse.id,
        //     })
        //     .then(() => onClose())
        // }
        // disabled={!selectedDate || !isWithinOpeningHours(selectedDate)}
        color="primary"
        sx={{ width: "fit-content", marginX: { xs: "auto", md: 0 } }}
      >
        Confirm Appointment
      </Button>
    </RsModal>
  );
};
