import { Box, Step, stepClasses, Stepper, Typography } from "@mui/joy";

import { formatWithoutTz, LoanResponseStatusEnum } from "@roshi/shared";
import { FC } from "react";
import { useSearchParams } from "react-router-dom";
import { useDeleteMyLoanRequest, useGetMyLoanRequest } from "../../api/useLoanRequestApi";
import { OpenDialog } from "../../context/DialogContainer";
import { useUserContext } from "../../context/userContext";
import { ASSETS } from "../../data/assets";
import useMediaQueries from "../../hooks/useMediaQueries";
import { Flex } from "../shared/flex";
import { ApplicationDetailsModal } from "./applicationDetailsModal";
import { UserOverviewModalType } from "./useUserOverview";
interface Props {
  application: NonNullable<ReturnType<typeof useGetMyLoanRequest>["data"]>;
  openModal: (loanResponseId: string, modal: UserOverviewModalType) => void;
  highlightOffers: () => void;
}

export const ApplicationStatus: FC<Props> = ({ application, openModal, highlightOffers }) => {
  const { user } = useUserContext();
  const deleteApplication = useDeleteMyLoanRequest();
  const [params, setParams] = useSearchParams();

  const isSingpassVerified = user && user.singpassData && user.singpassData.length > 0;
  const offersFound = application.loanResponses.filter((res) => res.status === LoanResponseStatusEnum.ACCEPTED).length;
  const appointment = application.loanResponses.find((res) => res.appointment)?.appointment;

  const handleDeleteApplication = () => {
    OpenDialog({
      image: ASSETS.UPDATE_DOC_ICON,
      submit: () => {
        deleteApplication.mutateAsync().then(() => window.location.reload());
      },
      type: "delete",
      title: "Are you sure you want to withdraw your loan application?",
      body: "Withdrawing your loan application means you will lose all progress. Are you sure you want to proceed?",
    });
  };

  const queryMedia = useMediaQueries(["sm"]);

  return (
    <>
      {params.get("applicationReview") === "true" && application && (
        <ApplicationDetailsModal
          loanRequest={application}
          applicantInfo={application.applicantInfo!}
          onDelete={handleDeleteApplication}
          onClose={() => setParams({})}
          isLoading={deleteApplication.isPending}
          title="Application Review"
        />
      )}
      <Box
        sx={{
          backgroundColor: "background.body",
          boxShadow: "md",
          borderRadius: "md",
          p: 2,
          paddingBottom: { sm: "35px" },
        }}
      >
        <Flex x yc sx={{ height: "100%" }}>
          <Stepper
            orientation={!queryMedia.sm ? "vertical" : "horizontal"}
            sx={{
              width: "100%",
              [`& .${stepClasses.root}::after`]: {
                backgroundColor: {
                  sm: "transparent",
                },
                backgroundImage: {
                  sm: "radial-gradient(currentColor 2px, transparent 2px)",
                },
                backgroundSize: {
                  sm: "7px 7px",
                },
                backgroundPosition: {
                  sm: "center left",
                },
              },
            }}
          >
            <Step
              indicator={
                <img
                  src={ASSETS.CHECKMARK}
                  style={{ width: 20, height: 20, filter: isSingpassVerified ? undefined : "saturate(0%)" }}
                />
              }
            >
              <Flex gap1 yc sx={{ justifyContent: { xs: "space-between" } }}>
                <Typography level="body-sm" fontWeight={"normal"}>
                  Singpass
                </Typography>
                <Typography
                  level="body-xs"
                  color={isSingpassVerified ? "lightPrimary" : "neutral"}
                  fontWeight={"bold"}
                  sx={{ top: 25, position: { sm: "absolute" }, whiteSpace: "nowrap" }}
                >
                  {isSingpassVerified ? "Verified" : "Not verified"}
                </Typography>
              </Flex>
            </Step>
            <Step
              indicator={
                <img
                  src={ASSETS.CHECKMARK}
                  style={{ width: 20, height: 20, filter: offersFound ? undefined : "saturate(0%)" }}
                />
              }
            >
              <Flex gap1 yc sx={{ justifyContent: { xs: "space-between" } }}>
                <Typography level="body-sm" fontWeight={"normal"}>
                  Offers
                </Typography>

                <Typography
                  level="body-xs"
                  color={offersFound ? "lightPrimary" : "neutral"}
                  fontWeight={"bold"}
                  sx={{ top: 25, position: { sm: "absolute" }, whiteSpace: "nowrap" }}
                >
                  {!offersFound ? "Searching" : `${offersFound} Offers Found`}
                </Typography>
              </Flex>
            </Step>
            <Step
              indicator={
                <img
                  src={ASSETS.CHECKMARK}
                  style={{ width: 20, height: 20, filter: appointment ? undefined : "saturate(0%)" }}
                />
              }
            >
              <Flex gap1 sx={{ justifyContent: { xs: "space-between" } }}>
                <Typography level="body-sm" fontWeight={"normal"}>
                  Appointment
                </Typography>
                <Flex y xe sx={{ top: 25, position: { sm: "absolute" } }}>
                  {offersFound ? (
                    appointment?.scheduledTime && !appointment.cancelledAt ? (
                      <Typography
                        level="body-xs"
                        onClick={() => openModal(appointment.loanResponseId, "appointment")}
                        sx={{ textDecoration: "underline", cursor: "pointer", whiteSpace: "nowrap" }}
                        color="primary"
                      >
                        {formatWithoutTz(appointment.scheduledTime, "dd MMM HH:mm")}
                      </Typography>
                    ) : (
                      <Flex x yst gap={1} flex={1} onClick={highlightOffers}>
                        <Typography
                          level="body-xs"
                          sx={{ textDecoration: "underline", cursor: "pointer", whiteSpace: "nowrap" }}
                          color="primary"
                          fontWeight={"bold"}
                        >
                          Book now
                        </Typography>
                        <img
                          onClick={highlightOffers}
                          src={ASSETS.ARROW_FORWARD}
                          style={{ width: 20, height: 20, cursor: "pointer" }}
                        />
                      </Flex>
                    )
                  ) : (
                    <Typography level="body-xs" color="neutral" sx={{ whiteSpace: "nowrap" }}>
                      Waiting for offers
                    </Typography>
                  )}
                </Flex>
              </Flex>
            </Step>
          </Stepper>
        </Flex>
      </Box>
    </>
  );
};
