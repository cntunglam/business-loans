import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Button, Typography } from "@mui/joy";
import { hasCustomerSupportPermissions, Prisma, SHARED_CONSTANTS } from "@roshi/shared";
import { addDays, format, getDay, isBefore, isSameDay } from "date-fns";
import { FC, useState } from "react";
import { useCreateAppointment } from "../../../api/useAppointmentApi";
import { useGetCompanyStores } from "../../../api/useCompanyApi";
import { useUserContext } from "../../../context/userContext";
import useMediaQueries from "../../../hooks/useMediaQueries";
import { Flex } from "../../shared/flex";
import { LoadingPage } from "../../shared/loadingPage";
import { RsDatePicker } from "../../shared/rsDatePicker";
import { RsModal } from "../../shared/rsModal";
import { StorePreview } from "./storePreview";

interface Props {
  loanResponse: Prisma.LoanResponseGetPayload<{ select: { id: true; lenderId: true } }>;
  onClose: () => void;
}

const minDate = new Date(Date.now() + SHARED_CONSTANTS.APPOINTMENT_RESERVE_MINUTES * 60 * 1000);

export const ScheduleAppointmentModal: FC<Props> = ({ loanResponse, onClose }) => {
  const { data, isLoading } = useGetCompanyStores(loanResponse.lenderId);
  const { user } = useUserContext();
  // Typing state correctly
  const [selected, setSelected] = useState<
    Prisma.CompanyStoreGetPayload<{ include: { openingHours: true } }> | undefined
  >(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const createAppointment = useCreateAppointment();
  const { sm } = useMediaQueries(["sm"]);
  const [step, setStep] = useState<"date" | "time">("date");
  const hasPermission = hasCustomerSupportPermissions(user?.role);

  const isWithinOpeningHours = (time: Date) => {
    if (!selected) return false; // Check for store selected or not

    if (hasPermission) {
      return true;
    }

    if (isSameDay(time, new Date()) && isBefore(time, minDate)) {
      return false;
    }

    const day = getDay(time);
    const storeDay = selected.openingHours.find((h) => h.isOpen && h.dayOfWeek === day);
    if (!storeDay || !storeDay.isOpen) return false;

    const [openHour, openMinute] = storeDay.openHour.split(":").map(Number);
    const [closeHour, closeMinute] = storeDay.closeHour.split(":").map(Number);
    const selectedHour = time.getHours();
    const selectedMinute = time.getMinutes();
    const isAfterOpen = selectedHour > openHour || (selectedHour === openHour && selectedMinute >= openMinute);
    const isBeforeClose = selectedHour < closeHour || (selectedHour === closeHour && selectedMinute < closeMinute);

    return isAfterOpen && isBeforeClose;
  };

  const mobileHeader = () => {
    if (!selected || sm) return "Schedule an appointment";
    return step === "date" ? "Select Date" : "Set Appointment Time";
  };

  const handleConfirmDate = () => {
    if (!selectedDate) return;
    setStep("time"); // Move to time selection
  };

  return (
    <RsModal onClose={onClose} fullscreenOnMobile sx={{ px: { xs: 0, md: 4 }, pb: { xs: 0, sm: 0, md: 0 } }}>
      {isLoading && <LoadingPage />}
      <Flex sx={{ position: "absolute", top: "12px", left: "20px" }}>
        <Typography
          sx={{
            fontWeight: "700",
            fontSize: "18px",
            cursor: "pointer",
            marginY: { md: 0, xs: "auto" },
          }}
          startDecorator={
            selected && (
              <ChevronLeft
                onClick={() => setStep("date")}
                sx={{ mr: 2, cursor: "pointer", display: { sm: "none", xs: "block" } }}
              />
            )
          }
          onClick={() => setSelected(undefined)}
        >
          {mobileHeader()}
        </Typography>
        {selected && sm && (
          <>
            <ChevronRight sx={{ my: "auto", cursor: "pointer" }} />
            <Typography sx={{ fontWeight: "700", fontSize: "18px" }}>Select Time and Date</Typography>
          </>
        )}
      </Flex>

      <Flex overflow={"auto"} y grow gap2 sx={{ position: "relative" }}>
        {!selected ? (
          <Flex
            gap2
            pt={2}
            pb={{ xs: 0, md: 2 }}
            px={{ xs: 1 }}
            fullwidth
            x
            xst
            sx={{ flexDirection: { md: "row", xs: "column" } }}
          >
            {data?.map((store) => (
              <StorePreview
                key={store.id}
                store={store}
                loanResponseId={loanResponse.id}
                onClose={onClose}
                selectLocation={() => setSelected(store)}
              />
            ))}
          </Flex>
        ) : (
          <Flex
            x
            grow
            gap1
            pt={2}
            pb={{ xs: 0, md: 4 }}
            minWidth={{ xs: "100%", sm: "100%", md: "90vw", xl: "70vw" }}
            sx={{ flexDirection: { md: "row", xs: "column" } }}
          >
            <Flex y gap2 fullwidth sx={{ borderRadius: "6px" }}>
              <RsDatePicker
                isTimeSelected={step}
                showTimeSelect
                open
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                calendarStartDay={1}
                minDate={hasPermission ? undefined : new Date()}
                maxDate={addDays(new Date(), 120)}
                filterDate={(date: Date) => {
                  if (hasPermission) return true;
                  else return selected.openingHours.some((h) => h.isOpen && getDay(date) === h.dayOfWeek);
                }}
                filterTime={isWithinOpeningHours}
              />
            </Flex>
            <Flex
              y
              gap2
              fullwidth
              grow
              p={{ xs: 0, md: 0 }}
              sx={{
                position: { xs: "sticky", sm: "unset", md: "unset" },
                bottom: 0,
                backgroundColor: { xs: "white", md: "transparent" },
                borderRadius: "6px",
              }}
            >
              <Flex
                y
                yc
                fullwidth
                gap2
                p={3}
                sx={{ boxShadow: "md", borderRadius: "6px", display: { xs: "none", md: "flex" } }}
              >
                <Typography level="title-lg">{selected.name}</Typography>
                <Typography>{selected.address}</Typography>
              </Flex>
              <Flex
                y
                ysb
                gap3
                fullwidth
                p={{ xs: 1, md: 3 }}
                sx={{
                  boxShadow: "md",
                  gap: { xs: 1, md: 3 },
                  textAlign: { xs: "center", md: "left" },
                  zIndex: 20,
                  borderRadius: "6px",
                }}
              >
                <Typography sx={{ display: { xs: "none", md: "block" } }}>Selected Date And Time</Typography>{" "}
                <Typography level="body-md" sx={{ display: { xs: "block", md: "none" } }}>
                  {selected.name}
                </Typography>
                <Typography level="h3">
                  {selectedDate?.toLocaleDateString("en-SG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  {selectedDate?.toLocaleTimeString("en-SG", { hour: "numeric", minute: "numeric" })}
                </Typography>
                {step === "date" && !sm ? (
                  <Button
                    disabled={!selectedDate}
                    size="lg"
                    onClick={handleConfirmDate}
                    sx={{ width: "fit-content", mx: "auto" }}
                  >
                    Select Time
                  </Button>
                ) : (
                  <Button
                    loading={createAppointment.isPending}
                    size="lg"
                    onClick={() =>
                      selectedDate &&
                      createAppointment
                        .mutateAsync({
                          storeId: selected.id,
                          scheduledTime: format(selectedDate, "yyyy-MM-dd'T'HH:mm':00Z'"),
                          loanResponseId: loanResponse.id,
                        })
                        .then(() => onClose())
                    }
                    disabled={!selectedDate || !isWithinOpeningHours(selectedDate)}
                    sx={{ width: "fit-content", marginX: { xs: "auto", md: 0 } }}
                  >
                    {"Confirm Appointment"}
                  </Button>
                )}
              </Flex>
            </Flex>
          </Flex>
        )}
      </Flex>
    </RsModal>
  );
};
