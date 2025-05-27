import { ChatBubbleOutline, CopyAll, MoreHoriz, Star, StarBorder } from "@mui/icons-material";
import { Box, Chip, Dropdown, Link, Menu, MenuButton, MenuItem, Tooltip, Typography, useTheme } from "@mui/joy";
import {
  AppointmentStatusEnum,
  DocumentTypeEnum,
  formatWithoutTz,
  LeadComputedStatusColors,
  LeadComputedStatusLabels,
  LeadTierEnum,
  LoanRequestStatusEnum,
  LoanRequestTypeEnum,
  MlcbGradeEnum,
} from "@roshi/shared";
import { format } from "date-fns";
import { FC, Fragment, useEffect } from "react";

import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AdminLead, useConvertToNormalLoanRequest, useUpdateLoanRequestAdmin } from "../../../api/useAdminApi";
import { OpenDialog } from "../../../context/DialogContainer";
import { ASSETS } from "../../../data/assets";
import { replaceLineBreak } from "../../../utils/replaceLineBreak";
import { formatToDisplayString, generateWhatsappLink, getDifference } from "../../../utils/utils";
import { formatApplicationData } from "../../shared/applicationDataFormatter";
import { CustomerSupportChip } from "../../shared/customersupportChip";
import { Flex } from "../../shared/flex";
import { RsEllipsis } from "../../shared/rsEllipsis";
import { RsTooltip } from "../../shared/rsTooltip";
import { ShortId } from "../../shared/shortId";
import { TableCell } from "../../shared/tableCell";
import { useLeadData } from "../../shared/useLeadData";

export interface LeadEntryProps {
  loanRequest: AdminLead;
  refetch: () => void;
}

const renderLeadTier = (tier?: LeadTierEnum) => {
  switch (tier) {
    case LeadTierEnum.PREMIUM:
      return <Chip sx={{ color: "white", backgroundColor: "gold" }}>Premium</Chip>;
    case LeadTierEnum.DELUXE:
      return <Chip sx={{ color: "white", backgroundColor: "purple" }}>Deluxe</Chip>;
    case LeadTierEnum.BASIC:
      return <Chip color="neutral">Basic</Chip>;
    case LeadTierEnum.REJECT:
      return <Chip color="danger">Rejected</Chip>;
    default:
      return <Chip color="neutral">Unrated</Chip>;
  }
};

const renderMlcbGrade = (grade?: MlcbGradeEnum) => {
  switch (grade) {
    case MlcbGradeEnum.GOOD:
      return <Chip sx={{ color: "white", backgroundColor: "green" }}>Good</Chip>;
    case MlcbGradeEnum.NORMAL:
      return (
        <Chip variant="outlined" color="primary">
          Normal
        </Chip>
      );
    case MlcbGradeEnum.SUB:
      return <Chip color="danger">Sub</Chip>;
    case MlcbGradeEnum.BAD:
      return <Chip color="danger">Bad</Chip>;
    default:
      return <Chip color="neutral">Unrated</Chip>;
  }
};

export const LeadEntry: FC<LeadEntryProps> = ({ loanRequest, refetch }) => {
  const theme = useTheme();
  const convertToNormalLoanRequest = useConvertToNormalLoanRequest();
  const updateLoanRequest = useUpdateLoanRequestAdmin();
  const [searchParams] = useSearchParams();

  const {
    openModal,
    accepted,
    rejected,
    pending,
    renderModal,
    acceptedOffers,
    unverifiedDocuments,
    responsesWithAppointment,
  } = useLeadData({ loanRequest, refetch });

  const FavoriteIcon = loanRequest.isFavorite ? Star : StarBorder;

  useEffect(() => {
    const parent = document.querySelector(`tr[data-id="${loanRequest.id}"]`);
    if (!parent) return;
    const isSelected = searchParams.get("selected") === loanRequest.id;
    parent.classList.toggle("selected-row", isSelected);
  }, [loanRequest.id, searchParams]);

  return (
    <Fragment key={loanRequest.id}>
      {renderModal()}
      <td>
        <FavoriteIcon
          sx={{ ":hover": { color: "neutral.400" }, cursor: "pointer" }}
          onClick={() =>
            updateLoanRequest
              .mutateAsync({ id: loanRequest.id, isFavorite: !loanRequest.isFavorite })
              .then(() => refetch())
          }
        />
      </td>
      <TableCell onClick={() => openModal("logs")}>
        {loanRequest.activityLogs.length ? `${getDifference(loanRequest.activityLogs[0].createdAt)} ago` : "NA"}
      </TableCell>

      <td>
        <ShortId id={loanRequest.id} onClick={() => openModal("details")} />
      </td>
      <td>
        <RsTooltip title={format(loanRequest.createdAt, "dd MMMM yyyy HH:mm")}>
          <Typography>{getDifference(loanRequest.createdAt)} ago</Typography>
        </RsTooltip>
      </td>
      <td>{loanRequest.type}</td>
      <td>
        <RsEllipsis text={loanRequest.applicantInfo?.fullname || ""} maxLines={2} />
      </td>
      <td>
        <Flex y>
          <Flex x yc gap1>
            <CopyAll
              sx={{ fontSize: "1rem", cursor: "pointer", ":hover": { color: "primary.500" } }}
              onClick={() => {
                if (!loanRequest.applicantInfo?.phoneNumber) return toast.error("No phone found");
                navigator.clipboard.writeText(loanRequest.applicantInfo?.phoneNumber || "");
                toast.success("Phone number copied to clipboard");
              }}
            />
            <ChatBubbleOutline
              htmlColor="black"
              onClick={() => window.open(`/admin/chat?targetId=${loanRequest.user.phone}`, "_blank")}
              sx={{ fontSize: "1rem", cursor: "pointer", ":hover": { color: "primary.500" } }}
            />
            <Link
              color="neutral"
              component="a"
              href={
                loanRequest.applicantInfo?.phoneNumber
                  ? generateWhatsappLink(loanRequest.applicantInfo.phoneNumber)
                  : ""
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
        </Flex>
      </td>
      <td>{formatApplicationData({ value: loanRequest.amount || 0, property: "amount" })}</td>
      <td>
        {formatApplicationData({ value: (loanRequest.applicantInfo?.monthlyIncome || 0) * 12, property: "amount" })}
      </td>
      <td>
        {formatToDisplayString(
          (loanRequest.applicantInfo?.lenderDebt || 0) / (loanRequest.applicantInfo?.monthlyIncome || 0),
          2
        )}
      </td>
      <TableCell onClick={() => openModal("mlcbReport")}>
        {renderMlcbGrade(loanRequest.grading?.mlcbGrade as MlcbGradeEnum)}
      </TableCell>
      <td>{renderLeadTier(loanRequest.grading?.leadTier as LeadTierEnum)}</td>
      <TableCell onClick={() => openModal("documents")}>
        <Chip
          variant="soft"
          color={unverifiedDocuments.length > 0 ? "danger" : undefined}
        >{`${loanRequest.applicantInfo?.documents?.length}/${Object.keys(DocumentTypeEnum).length}`}</Chip>
      </TableCell>
      {LeadComputedStatusLabels[loanRequest.leadComputedStatus] === LeadComputedStatusLabels.WON ? (
        <TableCell onClick={() => openModal("closedDealOffer")}>
          <Chip sx={{ backgroundColor: LeadComputedStatusColors[loanRequest.leadComputedStatus] }}>
            {LeadComputedStatusLabels[loanRequest.leadComputedStatus]}
          </Chip>
        </TableCell>
      ) : (
        <td>
          <Chip sx={{ backgroundColor: LeadComputedStatusColors[loanRequest.leadComputedStatus] }}>
            {LeadComputedStatusLabels[loanRequest.leadComputedStatus]}
          </Chip>
        </td>
      )}

      {/* <td>{loanRequest.status !== LoanRequestStatusEnum.DRAFT && <img src={ASSETS.CHECKMARK} height="20px" />}</td> */}
      <TableCell onClick={() => openModal("responses")}>
        <Flex x gap={0.5} yc xsb>
          <Flex x gap={0.5}>
            <span style={{ color: theme.palette.primary[500] }}>{accepted}</span> |{" "}
            <span style={{ color: theme.palette.danger[500] }}>{rejected}</span> |{" "}
            <span style={{ color: theme.palette.warning[500] }}>{pending}</span>
          </Flex>
          {loanRequest.approvedAt && (
            <Tooltip title="Approved">
              <img src={ASSETS.CHECKMARK} height="20px" />
            </Tooltip>
          )}
        </Flex>
      </TableCell>

      <TableCell onClick={acceptedOffers.length ? () => openModal("responses") : undefined}>
        {acceptedOffers.length > 0 && (
          <Chip endDecorator={acceptedOffers.length > 1 ? `+${acceptedOffers.length - 1}` : undefined}>
            {acceptedOffers[0].lender?.name}
          </Chip>
        )}
      </TableCell>
      <TableCell onClick={responsesWithAppointment.length > 0 ? () => openModal("appointments") : undefined}>
        <Box>
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
      </TableCell>
      <TableCell>
        <CustomerSupportChip
          customerSupport={loanRequest?.customerSupport}
          callback={refetch}
          loanRequestId={loanRequest.id}
        />
      </TableCell>
      <TableCell onClick={() => openModal("privateNote")}>
        <RsEllipsis text={replaceLineBreak(loanRequest?.privateNote || "")} maxLines={2} />
      </TableCell>
      <TableCell>
        <RsEllipsis text={replaceLineBreak(loanRequest?.referer || "")} maxLines={2} />
      </TableCell>
      <td>{loanRequest.isAutoReapply ? "YES" : "NO"}</td>
      <td>
        <Dropdown>
          <MenuButton size="sm">
            <MoreHoriz />
          </MenuButton>
          <Menu>
            {loanRequest.type === LoanRequestTypeEnum.ZERO_INTEREST && (
              <MenuItem
                onClick={() =>
                  OpenDialog({
                    type: "confirm",
                    title: "Convert to normal application",
                    body: "Are you sure you want to convert this loan request to a normal type? It will be shared with all lenders.",
                    submit: () => convertToNormalLoanRequest.mutateAsync(loanRequest.id).then(() => refetch()),
                  })
                }
              >
                Convert to normal
              </MenuItem>
            )}
            <MenuItem
              onClick={() =>
                OpenDialog({
                  type: "confirm",
                  title: "Close application?",
                  body: "Are you sure you want to close this application?",
                  submit: () =>
                    updateLoanRequest
                      .mutateAsync({ id: loanRequest.id, status: LoanRequestStatusEnum.DELETED })
                      .then(() => refetch()),
                })
              }
            >
              Withdraw
            </MenuItem>
          </Menu>
        </Dropdown>
      </td>
    </Fragment>
  );
};
