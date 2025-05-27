import { ExpandMore } from "@mui/icons-material";
import { Box, Dropdown, IconButton, Menu, MenuButton, MenuItem, Typography } from "@mui/joy";
import { DocumentTypeEnum, DocumentTypeEnumLabels, shortId } from "@roshi/shared";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { LenderDashboardApplication, LenderDashboardClosedApplication } from "../../../api/useLoanRequestApi";
import { ASSETS } from "../../../data/assets";
import { replaceLineBreak } from "../../../utils/replaceLineBreak";
import { formatRejectionReason } from "../../../utils/rsUtils";
import { hasNestedProperty } from "../../../utils/tsUtils";
import { getDifference } from "../../../utils/utils";
import CopyIcon from "../../icons/copyIcon";
import FlashIcon from "../../icons/flashIcon";
import NoteIcon from "../../icons/noteIcon";
import { formatApplicationData } from "../../shared/applicationDataFormatter";
import { Flex } from "../../shared/flex";
import { RsTooltip } from "../../shared/rsTooltip";
import { ViewDocumentBtn } from "../../shared/viewDocumentBtn";
import { OfferActions } from "../offerActions";

export type ColumnKeys = keyof typeof lenderDashboardColumns;

export const lenderDashboardColumns = {
  id: {
    key: "id",
    title: "ID",
    width: 150,
    render: (row: LenderDashboardApplication | LenderDashboardClosedApplication) =>
      row.id && (
        <Flex x yc justifyContent={"end"}>
          <Typography level="body-sm" sx={{ color: "#2F80ED" }}>
            {shortId(row.id)}
          </Typography>
          <IconButton
            size="sm"
            onClick={() => {
              if (!row.id) return toast.error("No ID found");
              navigator.clipboard.writeText(row.id);
              toast.success("ID copied to clipboard");
            }}
            aria-label="copy"
          >
            <CopyIcon stroke="#2F80ED" />
          </IconButton>
        </Flex>
      ),
  },
  residencyStatus: {
    key: "residencyStatus",
    title: "ID Type",
    width: 150,
    render: (row: LenderDashboardApplication) =>
      formatApplicationData({
        property: "residencyStatus",
        value: row?.applicantInfo?.residencyStatus,
      }),
  },
  amount: {
    key: "amount",
    title: "Requested ($)",
    align: "center",
    width: 110,
    render: (row: LenderDashboardApplication) => formatApplicationData({ property: "amount", value: row.amount }),
  },
  monthlyIncome: {
    key: "monthlyIncome",
    title: "M. Income ($)",
    align: "center",
    width: 110,
    render: (row: LenderDashboardApplication) =>
      formatApplicationData({
        property: "monthlyIncome",
        value: row?.applicantInfo?.monthlyIncome,
      }),
  },
  createdAt: {
    key: "createdAt",
    title: "Creation Date",
    width: 150,
    render: (row: LenderDashboardApplication) =>
      row.createdAt ? `${format(row.createdAt as Date, "dd MMM yy")} (${getDifference(row.createdAt)} ago)` : "N/A",
  },
  bankDebt: {
    key: "bankDebt",
    title: "Unsec. Bank Debt($)",
    align: "center",
    width: 120,
    render: (row: LenderDashboardApplication) =>
      formatApplicationData({
        property: "bankDebt",
        value: row?.applicantInfo?.bankDebt,
      }),
  },
  lenderDebt: {
    key: "lenderDebt",
    title: "ML Debt($)",
    align: "center",
    render: (row: LenderDashboardApplication) =>
      formatApplicationData({
        property: "lenderDebt",
        value: row.applicantInfo?.lenderDebt,
      }),
  },
  mlcbRatio: {
    key: "mlcbRatio",
    title: "ML Debt to income",
    align: "center",
    render: (row: LenderDashboardApplication) =>
      formatApplicationData({
        property: "mlcbRatio",
        value: row.applicantInfo?.mlcbRatio,
      }),
  },
  publicNote: {
    key: "publicNote",
    title: "Note from ROSHI",
    align: "center",
    render: (row: LenderDashboardApplication) =>
      row.publicNote && (
        <RsTooltip title={replaceLineBreak(row.publicNote || "")}>
          <IconButton>
            <NoteIcon stroke="#2F80ED" />
          </IconButton>
        </RsTooltip>
      ),
  },
  age: {
    key: "age",
    title: "Age",
    align: "center",
    render: (row: LenderDashboardApplication) =>
      formatApplicationData({
        property: "age",
        value: row.applicantInfo?.age,
      }),
  },
  term: {
    key: "term",
    title: "Requested Term",
    render: (row: LenderDashboardApplication) => `${row.term} months`,
  },
  employmentStatus: {
    key: "employmentStatus",
    title: "Employment",
    width: 150,
    render: (row: LenderDashboardApplication) =>
      formatApplicationData({
        property: "employmentStatus",
        value: row?.applicantInfo?.employmentStatus,
      }),
  },
  previousEmploymentTime: {
    key: "previousEmploymentTime",
    title: "Prev. Employ. Time",
    width: 150,
    render: (row: LenderDashboardApplication) =>
      formatApplicationData({
        property: "previousEmploymentTime",
        value: row?.applicantInfo?.previousEmploymentTime,
      }),
  },
  currentEmploymentTime: {
    key: "currentEmploymentTime",
    title: "Empl. Time",
    width: 150,
    render: (row: LenderDashboardApplication) =>
      formatApplicationData({
        property: "currentEmploymentTime",
        value: row?.applicantInfo?.currentEmploymentTime,
      }),
  },
  purpose: {
    key: "purpose",
    title: "Purpose",
    width: 150,
    render: (row: LenderDashboardApplication) =>
      formatApplicationData({
        property: "purpose",
        value: row.purpose,
      }),
  },
  propertyOwnership: {
    key: "propertyOwnership",
    title: "Prop. Ownership",
    width: 150,
    render: (row: LenderDashboardApplication) =>
      formatApplicationData({
        property: "propertyOwnership",
        value: row?.applicantInfo?.propertyOwnership,
      }),
  },
  jobTitle: {
    key: "jobTitle",
    title: "Job Title",
    render: (row: LenderDashboardApplication) =>
      formatApplicationData({
        property: "jobTitle",
        value: row?.applicantInfo?.jobTitle,
      }),
  },
  document: {
    key: "document",
    title: "Document",
    width: 250,
    render: (row: LenderDashboardApplication) => (
      <>
        {Array.isArray(row?.applicantInfo?.documents) && (
          <Flex x yc gap2>
            {row?.applicantInfo?.documents?.[0] && (
              <ViewDocumentBtn filename={row?.applicantInfo?.documents?.[0]?.filename}>
                <Typography textColor="link.500">
                  {DocumentTypeEnumLabels[row?.applicantInfo?.documents?.[0]?.documentType as DocumentTypeEnum] || (
                    <img src={ASSETS.VIEW} height={"24px"} />
                  )}
                </Typography>
              </ViewDocumentBtn>
            )}
            {row?.applicantInfo?.documents?.[1] && (
              <ViewDocumentBtn filename={row?.applicantInfo?.documents?.[1]?.filename}>
                <Typography textColor="link.500">
                  {DocumentTypeEnumLabels[row?.applicantInfo?.documents?.[1]?.documentType as DocumentTypeEnum] || (
                    <img src={ASSETS.VIEW} height={"24px"} />
                  )}
                </Typography>
              </ViewDocumentBtn>
            )}
            {row.applicantInfo.documents.length > 2 && (
              <Dropdown var>
                <MenuButton variant="plain" color="link">
                  <Typography textColor={"link.500"} level="body-sm">
                    More
                  </Typography>
                  <ExpandMore />
                </MenuButton>
                <Menu color="link">
                  {row.applicantInfo.documents.slice(2).map((doc) => (
                    <MenuItem>
                      <ViewDocumentBtn filename={doc?.filename}>
                        <Typography textColor="link.500">
                          {DocumentTypeEnumLabels[doc.documentType as DocumentTypeEnum] || (
                            <img src={ASSETS.VIEW} height={"24px"} />
                          )}
                        </Typography>
                      </ViewDocumentBtn>
                    </MenuItem>
                  ))}
                </Menu>
              </Dropdown>
            )}
          </Flex>
        )}
      </>
    ),
  },
  type: {
    key: "type",
    title: "Type",
    align: "center",
    width: 70,
    render: (row: LenderDashboardApplication) =>
      !!row?.loanResponses?.[0]?.isAuto && (
        <Box sx={{ color: "secondary.500", display: "flex ", justifyContent: "space-evenly", alignItems: "center" }}>
          <RsTooltip title="Instant Offer">
            <FlashIcon color="secondary" />
          </RsTooltip>
        </Box>
      ),
  },
  action: {
    key: "action",
    title: "Action",
    pinned: "right",
    width: 200,
    render: (row: LenderDashboardApplication) => (
      <Flex x xe bgcolor="white" sx={{ mx: "-0.5rem", px: "0.5rem" }}>
        <OfferActions application={row} />
      </Flex>
    ),
  },
  fullname: {
    key: "fullname",
    title: "Client Name",
    width: 250,
    render: (row: LenderDashboardApplication | LenderDashboardClosedApplication) =>
      formatApplicationData({
        property: "fullname",
        value: hasNestedProperty(row, "applicantInfo", "fullname")
          ? row.applicantInfo.fullname
          : hasNestedProperty(row, "user", "name")
            ? row.user.name
            : "-",
      }),
  },
  nricNo: {
    key: "nricNo",
    title: "Số CCCD",
    width: 150,
    render: (row: LenderDashboardApplication) => row.applicantInfo?.nric || "-",
  },
  loanResponse: {
    key: "loanResponse",
    title: "Rejected date",
    width: 200,
    render: (row: LenderDashboardApplication) =>
      row?.loanResponses?.[0]?.createdAt
        ? `${format(row?.loanResponses?.[0]?.createdAt as Date, "dd MMM yy HH:mm")} (${getDifference(row?.loanResponses?.[0]?.createdAt)} ago)`
        : "N/A",
  },
  rejectionReasons: {
    key: "rejectionReasons",
    title: "Rejected Reason",
    width: 900,
    render: (row: LenderDashboardApplication) => formatRejectionReason(row?.loanResponses?.[0]),
  },
  closedAmount: {
    key: "closedAmount",
    title: "Approved Amount",
    width: 233,
    align: "center",
    render: (row: LenderDashboardClosedApplication) =>
      row?.loanResponses?.[0]?.closedDealOffer?.amount
        ? formatApplicationData({
            property: "amount",
            value: row?.loanResponses?.[0]?.closedDealOffer?.amount,
          })
        : "-",
  },
  closedInterest: {
    key: "closedInterest",
    title: "Interest Rate",
    width: 233,
    align: "center",
    render: (row: LenderDashboardClosedApplication) =>
      row?.loanResponses?.[0]?.closedDealOffer?.monthlyInterestRate
        ? formatApplicationData({
            property: "interestRate",
            value: row?.loanResponses?.[0]?.closedDealOffer?.monthlyInterestRate,
          })
        : "-",
  },
  closedTenure: {
    key: "closedTenure",
    title: "Tenure",
    width: 233,
    align: "center",
    render: (row: LenderDashboardClosedApplication) =>
      row?.loanResponses?.[0]?.closedDealOffer?.term
        ? formatApplicationData({
            property: "term",
            value: row?.loanResponses?.[0]?.closedDealOffer?.term,
          })
        : "-",
  },
  disbursementDate: {
    key: "disbursementDate",
    title: "Disbursement Date",
    width: 250,
    align: "center",
    render: (row: LenderDashboardClosedApplication) =>
      row?.loanResponses?.[0]?.disbursementDate || row?.loanResponses?.[0]?.closedDealOffer?.createdAt
        ? formatApplicationData({
            property: "createdAt",
            value: row?.loanResponses?.[0]?.disbursementDate || row?.loanResponses?.[0]?.closedDealOffer?.createdAt,
          })
        : "-",
  },
} as const;

export const approvedColumns = [
  lenderDashboardColumns.residencyStatus,
  lenderDashboardColumns.amount,
  lenderDashboardColumns.monthlyIncome,
  lenderDashboardColumns.id,
  lenderDashboardColumns.createdAt,
  lenderDashboardColumns.bankDebt,
  lenderDashboardColumns.lenderDebt,
  lenderDashboardColumns.mlcbRatio,
  lenderDashboardColumns.age,
  lenderDashboardColumns.term,
  lenderDashboardColumns.employmentStatus,
  lenderDashboardColumns.previousEmploymentTime,
  lenderDashboardColumns.currentEmploymentTime,
  lenderDashboardColumns.purpose,
  lenderDashboardColumns.propertyOwnership,
  lenderDashboardColumns.jobTitle,
  lenderDashboardColumns.document,
  lenderDashboardColumns.type,
  { ...lenderDashboardColumns.action, width: 110 },
] as const;

export const acceptedOffersColumns = [
  lenderDashboardColumns.fullname,
  lenderDashboardColumns.nricNo,
  lenderDashboardColumns.residencyStatus,
  lenderDashboardColumns.amount,
  lenderDashboardColumns.monthlyIncome,
  lenderDashboardColumns.id,
  lenderDashboardColumns.createdAt,
  lenderDashboardColumns.bankDebt,
  lenderDashboardColumns.lenderDebt,
  lenderDashboardColumns.mlcbRatio,
  lenderDashboardColumns.age,
  lenderDashboardColumns.term,
  lenderDashboardColumns.employmentStatus,
  lenderDashboardColumns.previousEmploymentTime,
  lenderDashboardColumns.currentEmploymentTime,
  lenderDashboardColumns.purpose,
  lenderDashboardColumns.propertyOwnership,
  lenderDashboardColumns.jobTitle,
  lenderDashboardColumns.document,
  lenderDashboardColumns.type,
  lenderDashboardColumns.action,
] as const;

export const closedOffersColumns = [
  lenderDashboardColumns.fullname,
  lenderDashboardColumns.id,
  lenderDashboardColumns.closedAmount,
  lenderDashboardColumns.closedInterest,
  lenderDashboardColumns.closedTenure,
  lenderDashboardColumns.disbursementDate,
] as const;

export const newColumns = [
  lenderDashboardColumns.residencyStatus,
  lenderDashboardColumns.amount,
  lenderDashboardColumns.monthlyIncome,
  lenderDashboardColumns.id,
  lenderDashboardColumns.createdAt,
  lenderDashboardColumns.bankDebt,
  lenderDashboardColumns.lenderDebt,
  lenderDashboardColumns.mlcbRatio,
  lenderDashboardColumns.age,
  lenderDashboardColumns.term,
  lenderDashboardColumns.employmentStatus,
  lenderDashboardColumns.previousEmploymentTime,
  lenderDashboardColumns.currentEmploymentTime,
  lenderDashboardColumns.purpose,
  lenderDashboardColumns.propertyOwnership,
  lenderDashboardColumns.jobTitle,
  lenderDashboardColumns.document,
  { ...lenderDashboardColumns.action, width: 180 },
] as const;

export const rejectedColumns = [
  lenderDashboardColumns.createdAt,
  lenderDashboardColumns.id,
  lenderDashboardColumns.loanResponse,
  lenderDashboardColumns.rejectionReasons,
] as const;
