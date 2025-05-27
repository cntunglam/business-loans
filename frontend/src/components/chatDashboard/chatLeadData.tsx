import { CopyAll, Edit, MoreHoriz, Verified } from "@mui/icons-material";
import { Box, Chip, Dropdown, Link, Menu, MenuButton, MenuItem, Typography, useTheme } from "@mui/joy";
import {
  AppointmentStatusEnum,
  formatWithoutTz,
  LeadComputedStatusColors,
  LeadComputedStatusLabels,
  LoanRequestStatusEnum,
} from "@roshi/shared";
import { FC } from "react";
import { toast } from "react-toastify";
import { AdminLead, useUpdateLoanRequestAdmin } from "../../api/useAdminApi";
import { OpenDialog } from "../../context/DialogContainer";
import { generateWhatsappLink, getDifference } from "../../utils/utils";
import { formatApplicationData } from "../shared/applicationDataFormatter";
import { Flex } from "../shared/flex";
import { RsEllipsis } from "../shared/rsEllipsis";
import { useLeadData } from "../shared/useLeadData";
interface Props {
  loanRequest: AdminLead;
  refetch: () => void;
}
export const ChatLeadData: FC<Props> = ({ loanRequest, refetch }) => {
  const theme = useTheme();
  const { openModal, accepted, rejected, pending, renderModal, responsesWithAppointment, acceptedOffers } = useLeadData(
    {
      loanRequest,
      refetch,
    }
  );
  const updateLoanRequest = useUpdateLoanRequestAdmin();
  return (
    <Flex x gap2 py={1}>
      {renderModal()}
      {/* <Flex>
        <FavoriteIcon
          sx={{ ":hover": { color: "neutral.400" }, cursor: "pointer" }}
          onClick={() =>
            updateLoanRequest
              .mutateAsync({ id: loanRequest.id, isFavorite: !loanRequest.isFavorite })
              .then(() => refetch())
          }
        />
      </Flex> */}
      <Flex y>
        <RsEllipsis sx={{ fontWeight: 600 }} text={loanRequest.applicantInfo?.fullname || ""} maxLines={2} />
        <Flex x yc gap1>
          <CopyAll
            sx={{ fontSize: "1rem", cursor: "pointer", ":hover": { color: "primary.500" } }}
            onClick={() => {
              if (!loanRequest.applicantInfo?.phoneNumber) return toast.error("No phone found");
              navigator.clipboard.writeText(loanRequest.applicantInfo?.phoneNumber || "");
              toast.success("Phone number copied to clipboard");
            }}
          />
          <Link
            level="body-sm"
            color="neutral"
            component="a"
            href={
              loanRequest.applicantInfo?.phoneNumber ? generateWhatsappLink(loanRequest.applicantInfo.phoneNumber) : ""
            }
            target="_blank"
          >
            {loanRequest.applicantInfo?.phoneNumber}
          </Link>
        </Flex>
        <Flex x yc gap1>
          <CopyAll
            sx={{ fontSize: "1rem", cursor: "pointer", ":hover": { color: "primary.500" } }}
            onClick={() => {
              if (!loanRequest.user?.email) return toast.error("No email found");
              navigator.clipboard.writeText(loanRequest.user.email);
              toast.success("Email copied to clipboard");
            }}
          />
          <Link
            level="body-sm"
            color="neutral"
            component="a"
            href={`mailto:${loanRequest.user?.email}`}
            target="_blank"
            style={{
              maxWidth: "200px",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
              display: "block",
            }}
          >
            {loanRequest.user?.email}
          </Link>
        </Flex>
        {LeadComputedStatusLabels[loanRequest.leadComputedStatus] === LeadComputedStatusLabels.WON ? (
          <Flex hover pointer onClick={() => openModal("closedDealOffer")}>
            <Chip sx={{ backgroundColor: LeadComputedStatusColors[loanRequest.leadComputedStatus] }}>
              {LeadComputedStatusLabels[loanRequest.leadComputedStatus]}
            </Chip>
          </Flex>
        ) : (
          <td>
            <Chip sx={{ backgroundColor: LeadComputedStatusColors[loanRequest.leadComputedStatus] }}>
              {LeadComputedStatusLabels[loanRequest.leadComputedStatus]}
            </Chip>
          </td>
        )}
      </Flex>
      <Flex y yst grow minWidth={"150px"}>
        <Typography level="body-sm">
          Amount: {formatApplicationData({ value: loanRequest.amount || 0, property: "amount" })}
        </Typography>
        <Typography level="body-sm">
          Income:{" "}
          {formatApplicationData({ value: (loanRequest.applicantInfo?.monthlyIncome || 0) * 12, property: "amount" })}
        </Typography>
        <Flex y hover pointer onClick={() => openModal("logs")}>
          <Typography level="body-sm">
            {loanRequest.activityLogs.length
              ? `Last activity ${getDifference(loanRequest.activityLogs[0].createdAt)} ago`
              : "NA"}
          </Typography>
          <Typography level="body-sm">Created {getDifference(loanRequest.createdAt)} ago</Typography>
        </Flex>
      </Flex>
      <Flex y gap={0.5} yc xsb minWidth={"130px"}>
        <Flex x yc gap={0.5} onClick={() => openModal("responses")} pointer hover grow px={1}>
          <Typography level={"body-sm"} style={{ color: theme.palette.primary[500] }}>
            {accepted}
          </Typography>{" "}
          |{" "}
          <Typography level={"body-sm"} style={{ color: theme.palette.danger[500] }}>
            {rejected}
          </Typography>{" "}
          |{" "}
          <Typography level={"body-sm"} style={{ color: theme.palette.warning[500] }}>
            {pending}
          </Typography>
        </Flex>
        <Flex pointer hover yc onClick={acceptedOffers.length ? () => openModal("responses") : undefined}>
          {acceptedOffers.length > 0 ? (
            <Chip endDecorator={acceptedOffers.length > 1 ? `+${acceptedOffers.length - 1}` : undefined}>
              {acceptedOffers[0].lender.name}
            </Chip>
          ) : (
            <Typography level="body-sm">No offer selected</Typography>
          )}
        </Flex>
        <Flex
          yc
          grow
          onClick={responsesWithAppointment.length > 0 ? () => openModal("appointments") : undefined}
          hover
          pointer
        >
          <Box>
            {!responsesWithAppointment.length && <Typography level="body-sm">No appointment</Typography>}
            {responsesWithAppointment.map((lr) => (
              <Chip
                key={lr.id}
                size="sm"
                color={lr.appointment!.status === AppointmentStatusEnum.REQUESTED_BY_BORROWER ? "warning" : "primary"}
                sx={{ maxWidth: "230px" }}
              >
                {lr.appointment!.scheduledTime
                  ? `${formatWithoutTz(lr.appointment!.scheduledTime, "dd MMM HH:mm")}`
                  : "Requested"}
              </Chip>
            ))}
          </Box>
        </Flex>
      </Flex>
      <Flex y xst gap1>
        {/* <Flex hover pointer onClick={() => openModal("publicNote")}>
          {loanRequest?.publicNote ? (
            <RsEllipsis text={replaceLineBreak(loanRequest?.publicNote || "")} maxLines={1} />
          ) : (
            "Add public note"
          )}
        </Flex> */}

        <Flex x xst fullwidth yc gap2 minWidth={"50px"}>
          {loanRequest.applicantInfo?.hasSingpassData && (
            <Verified color="primary" onClick={() => openModal("singpass")} sx={{ cursor: "pointer" }} />
          )}
          <Dropdown>
            <MenuButton size="sm">
              <MoreHoriz />
            </MenuButton>
            <Menu>
              <MenuItem
                onClick={() =>
                  OpenDialog({
                    type: "confirm",
                    title: "Close application?",
                    body: "Are you sure you want to close this application?",
                    submit: () =>
                      updateLoanRequest
                        .mutateAsync({
                          id: loanRequest.id,
                          status:
                            loanRequest.status === LoanRequestStatusEnum.DELETED
                              ? LoanRequestStatusEnum.ACTIVE
                              : LoanRequestStatusEnum.DELETED,
                        })
                        .then(() => refetch()),
                  })
                }
              >
                {loanRequest.status === LoanRequestStatusEnum.DELETED ? "Restore" : "Withdraw"}
              </MenuItem>
            </Menu>
          </Dropdown>
        </Flex>
        <Flex x gap1 yst>
          <Edit
            sx={{ fontSize: "1.2rem", cursor: "pointer", ":hover": { filter: "brightness(150%)" } }}
            onClick={() => openModal("privateNote")}
          />
          <RsEllipsis
            text={loanRequest?.privateNote || "No note"}
            maxLines={2}
            sx={{ color: "secondary.400", fontSize: "sm" }}
          />
        </Flex>
        <Typography fontSize="sm">Is Reapply: {loanRequest.isAutoReapply ? "YES" : "NO"}</Typography>
      </Flex>
    </Flex>
  );
};
