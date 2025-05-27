import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import { Button, Checkbox, Input, Table } from "@mui/joy";
import {
  DocumentVerificationStatusEnum,
  LeadComputedStatus,
  LeadTierEnum,
  MlcbGradeEnum,
  ReapplyFilterType,
  StatusEnum,
  UserRoleEnum,
} from "@roshi/shared";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminLead, useGetAllLeadsAdmin } from "../../../api/useAdminApi";
import { useUserContext } from "../../../context/userContext";
import { useScrollableTable } from "../../../hooks/useScrollableTable";
import { CustomNavigateBefore, CustomNavigateNext } from "../../shared/customerNavigateButton ";
import { EntryWrapper } from "../../shared/entryWrapper";
import { Flex } from "../../shared/flex";
import { LoadingPage } from "../../shared/loadingPage";
import { RsInputDatePicker } from "../../shared/rsInuputDatePicker";
import { RsSelect } from "../../shared/rsSelect";
import { ApplicationDetailsWrapper } from "../../userDashboard/applicationDetailsWrapper";
import { LeadEntry } from "./leadEntry";

enum LeadFilters {
  HAS_APPOINTMENTS = "Has appointment",
  HAS_UNVERIFIED_DOCS = "Has documents to verify",
  IS_FAVORITE = "Favorite",
  IS_NOT_TRACKED = "Not tracked",
}

const TABLE_HEADER: { key: string; label: string; sortable?: boolean; width: string }[] = [
  { key: "isFavorite", label: "Fav", width: "50px" },
  { key: "activity", label: "Activity", sortable: true, width: "60px" },
  { key: "id", label: "Short ID", width: "130px" },
  { key: "createdAt", label: "Date", sortable: true, width: "80px" },
  { key: "type", label: "Type", sortable: false, width: "120px" },
  { key: "fullname", label: "Name", width: "120px" },
  { key: "contact", label: "Contact", width: "150px" },
  { key: "loanAmount", label: "Amount", width: "100px", sortable: true },
  { key: "annualIncome", label: "Ann. income", width: "100px", sortable: true },
  { key: "debtToIncome", label: "DTI", width: "50px" },
  { key: "mlcbGrade", label: "MLCB Grade", width: "100px" },
  { key: "leadTier", label: "Lead tier", width: "100px" },
  // { key: "communication", label: "Comm", width: "70px" },
  { key: "docs", label: "Docs", width: "60px" },
  { key: "status", label: "Status", width: "130px" },
  // { key: "isApproved", label: "Approved", width: "80px" },
  { key: "responses", label: "Offers", width: "100px" },
  { key: "accepted", label: "Accepted", width: "200px" },
  { key: "appointment", label: "Appointment", sortable: true, width: "120px" },
  { key: "customerSupport", label: "Customer Support", width: "200px" },
  { key: "privateNote", label: "Private Note", width: "200px" },
  { key: "referer", label: "Referer", width: "200px" },
  { key: "singpass", label: "Singpass", width: "80px" },
  { key: "reapply", label: "Is Reapply", width: "80px" },
  { key: "actions", label: "Actions", width: "100px" },
];

type SORT_FIELDS = "activity" | "createdAt" | "appointment" | "loanAmount" | "annualIncome";
type SORT_TYPE = "desc" | "asc";

function sortingFunction(ascending: boolean, sortCol: string) {
  return (a: AdminLead, b: AdminLead) => {
    let targetA = 0;
    let targetB = 0;

    if (sortCol === "appointment") {
      targetA =
        a?.loanResponses
          .filter((lr) => lr.appointment && lr.outcomeStatus === StatusEnum.PENDING)[0]
          ?.appointment?.scheduledTime?.getTime() || 0;
      targetB =
        b?.loanResponses
          .filter((lr) => lr.appointment && lr.outcomeStatus === StatusEnum.PENDING)[0]
          ?.appointment?.scheduledTime?.getTime() || 0;
    } else if (sortCol === "activity") {
      targetA = a.activityLogs.length === 0 ? a.createdAt.getTime() : a?.activityLogs[0]?.createdAt.getTime();
      targetB = b.activityLogs.length === 0 ? b.createdAt.getTime() : b?.activityLogs[0]?.createdAt.getTime();
    } else if (sortCol === "createdAt") {
      targetA = a.createdAt.getTime();
      targetB = b.createdAt.getTime();
    } else if (sortCol === "loanAmount") {
      targetA = a.amount;
      targetB = b.amount;
    } else if (sortCol === "annualIncome") {
      targetA = a.applicantInfo?.monthlyIncome || 0;
      targetB = b.applicantInfo?.monthlyIncome || 0;
    }

    return (targetA - targetB) * (ascending ? -1 : 1);
  };
}

export const LeadsTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [sortCol, setSortCol] = useState<SORT_FIELDS>("activity");
  const [sortOrd, setSortOrd] = useState<SORT_TYPE>("desc");
  const [filters, setFilters] = useState<{
    name?: string;
    id?: string;
    phone?: string;
    status?: LeadComputedStatus[];
    reapply?: ReapplyFilterType;
    leadTier?: LeadTierEnum & "ALL";
    mlcbGrade?: MlcbGradeEnum & "ALL";
    date?: Date[];
    booleanFilters?: LeadFilters[];
    referer?: string;
  }>({
    id: searchParams.get("loanRequest") || undefined,
  });
  const { query: loanRequests, params, setParams } = useGetAllLeadsAdmin();

  const selectedLoanRequest = searchParams.get("loanRequestId");

  type FILTER_KEYS = keyof typeof filters;

  const { user } = useUserContext();

  const data = useMemo(() => {
    const sortingData = (result: AdminLead[]) => {
      result.sort(sortingFunction(sortOrd === "desc", sortCol));
    };

    // mapping filters condition
    function mappFiltersCondition(item: AdminLead, key: FILTER_KEYS) {
      // filter by - user name
      if (key === "name" && filters.name) {
        return item.applicantInfo?.fullname?.toLowerCase().includes(filters.name.toLowerCase());
      }
      // filter by - user phone
      if (key === "phone" && filters.phone) {
        return item.applicantInfo?.phoneNumber?.includes(filters.phone);
      }
      // filter by - lead id
      if (key === "id" && filters.id && item.id) {
        return item.id.toLowerCase().includes(filters.id.toLowerCase());
      }

      // filter by - lead creation date
      if (key === "date" && filters.date?.[0] && filters.date?.[1]) {
        return item.createdAt > filters.date[0] && item.createdAt < filters.date[1];
      }
      // filter by - lead isFavorite
      if (key === "booleanFilters" && filters.booleanFilters) {
        return filters.booleanFilters.every((filterName) => {
          if (filterName === LeadFilters.IS_FAVORITE) return item.isFavorite;
          if (filterName === LeadFilters.HAS_APPOINTMENTS)
            return item.loanResponses.some((res) => res.appointment && res.outcomeStatus === StatusEnum.PENDING);
          if (filterName === LeadFilters.HAS_UNVERIFIED_DOCS)
            return item.applicantInfo?.documents?.some(
              (doc) => doc.humanVerificationStatus === DocumentVerificationStatusEnum.NOT_VERIFIED
            );
          if (filterName === LeadFilters.IS_NOT_TRACKED) return item.supportData.isNotTracked;
        });
      }
      if (key === "status" && filters.status) {
        return filters.status.includes(item.leadComputedStatus);
      }
      if (key === "referer" && filters.referer && filters.referer !== "ALL") {
        return item.referer && item.referer === filters.referer;
      }
      if (key === "reapply" && filters.reapply !== ReapplyFilterType.ALL) {
        if (filters.reapply === ReapplyFilterType.REAPPLY) return item.isAutoReapply;
        if (filters.reapply === ReapplyFilterType.NON_REAPPLY) return !item.isAutoReapply;
      }
      if (key === "leadTier" && filters.leadTier && filters.leadTier !== "ALL") {
        return item.grading?.leadTier && item.grading?.leadTier === filters.leadTier;
      }
      if (key === "mlcbGrade" && filters.mlcbGrade && filters.mlcbGrade !== "ALL") {
        return item.grading?.mlcbGrade && item.grading?.mlcbGrade === filters.mlcbGrade;
      }
      return true;
    }

    const filteringData = (result: AdminLead[]) => {
      const params = Object.entries(filters);
      return result.filter((item) => {
        if (!filters.booleanFilters?.includes(LeadFilters.IS_NOT_TRACKED) && item.supportData.isNotTracked)
          return false;
        return params.every(([key]) => mappFiltersCondition(item, key as FILTER_KEYS));
      });
    };

    if (!loanRequests.data?.length) return [];
    // handle filtering
    const result = filteringData(loanRequests.data);
    // handle sorting
    sortingData(result);
    return result;
  }, [loanRequests, sortOrd, sortCol, filters]);

  const renderSortable = useCallback(
    (item: { key: string; label: string; sortable?: boolean }) => {
      if (!item.sortable) return;

      return (
        <>
          {sortCol === item.key ? (
            sortOrd === "asc" ? (
              <ArrowDropUp color="primary" />
            ) : (
              <ArrowDropDown color="primary" />
            )
          ) : (
            <ArrowDropDown />
          )}
        </>
      );
    },
    [sortCol, sortOrd]
  );

  const handleSortChange = useCallback(
    (key: SORT_FIELDS) => (e: React.MouseEvent<HTMLTableCellElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setSortOrd((prev) => (sortCol !== key ? "desc" : prev === "desc" ? "asc" : "desc"));
      setSortCol(key);
    },
    [sortCol]
  );

  const handleFilterChange = useCallback(
    (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setFilters({
        ...filters,
        [key]: e.target.value,
      });
    },
    [filters]
  );

  const { tableRef, showLeftButton, showRightButton, scrollLeft, scrollRight } = useScrollableTable(
    loanRequests.isLoading
  );

  const uniqueReferrers = useMemo(() => {
    const arr = Array.from(new Set(((loanRequests?.data || []) as AdminLead[]).map((lr) => lr.referer))).filter(
      Boolean
    ) as string[];
    return arr.sort((a, b) => a.length - b.length);
  }, [loanRequests?.data]) as string[];

  return (
    <Flex y>
      <LoadingPage variant="overlay" isLoading={loanRequests.isLoading} />
      {selectedLoanRequest && (
        <ApplicationDetailsWrapper loanRequestId={selectedLoanRequest} onClose={() => setSearchParams({})} />
      )}
      <Flex x yc gap1 py={1} wrap>
        {user?.role === UserRoleEnum.ADMIN && (
          <Checkbox
            label="Show expired"
            checked={params.filters?.showExpired || false}
            onChange={(e) => setParams({ filters: { showExpired: e.target.checked } })}
          />
        )}
        <RsSelect
          placeholder="Filters"
          sx={{ width: "200px" }}
          multiple
          values={Object.keys(LeadFilters).map((key) => LeadFilters[key as keyof typeof LeadFilters])}
          setValue={(val) =>
            setFilters({
              ...filters,
              booleanFilters: val?.length === 0 ? undefined : (val as LeadFilters[]),
            })
          }
        />
        <RsSelect
          placeholder="Status"
          sx={{ width: "200px" }}
          multiple
          values={Object.keys(LeadComputedStatus).map(
            (key) => LeadComputedStatus[key as keyof typeof LeadComputedStatus]
          )}
          setValue={(val) =>
            setFilters({
              ...filters,
              status: val?.length === 0 ? undefined : (val as LeadComputedStatus[]),
            })
          }
        />
        <RsSelect
          placeholder="Referer"
          sx={{ width: "200px" }}
          values={["ALL", ...uniqueReferrers]}
          setValue={(val) =>
            setFilters({
              ...filters,
              referer: val ? `${val}` : undefined,
            })
          }
        />
        <RsSelect
          placeholder="Reapply"
          sx={{ width: "120px" }}
          values={Object.keys(ReapplyFilterType).map((key) => ReapplyFilterType[key as keyof typeof ReapplyFilterType])}
          setValue={(val) => {
            setFilters({
              ...filters,
              reapply: val ? (val as ReapplyFilterType) : undefined,
            });
          }}
        />
        <RsSelect
          placeholder="Mlcb Grade"
          sx={{ width: "120px" }}
          values={["ALL", ...Object.keys(MlcbGradeEnum).map((key) => MlcbGradeEnum[key as keyof typeof MlcbGradeEnum])]}
          setValue={(val) => {
            setFilters({
              ...filters,
              mlcbGrade: val ? (val as MlcbGradeEnum & "ALL") : undefined,
            });
          }}
        />
        <RsSelect
          placeholder="Lead Tiers"
          sx={{ width: "120px" }}
          values={["ALL", ...Object.keys(LeadTierEnum).map((key) => LeadTierEnum[key as keyof typeof LeadTierEnum])]}
          setValue={(val) => {
            setFilters({
              ...filters,
              leadTier: val ? (val as LeadTierEnum & "ALL") : undefined,
            });
          }}
        />
        <Input
          placeholder="Search by Name"
          value={filters?.name || ""}
          onChange={handleFilterChange("name")}
          sx={{ width: "150px" }}
        />
        <Input
          placeholder="Search by Id"
          value={filters?.id || ""}
          onChange={handleFilterChange("id")}
          sx={{ width: "150px" }}
        />
        <Input
          placeholder="Search by Phone number"
          value={filters?.phone || ""}
          onChange={handleFilterChange("phone")}
          sx={{ width: "150px" }}
        />
        <RsInputDatePicker
          dateFormat="yyy/MM/dd"
          placeholderText="Filter by date"
          selectsRange={true}
          startDate={filters?.date?.[0] as Date | undefined}
          endDate={filters?.date?.[1] as Date | undefined}
          onChange={(date) =>
            setFilters({
              ...filters,
              date: date as Date[],
            })
          }
          customInput={<Input sx={{ width: "150px" }} />}
          disabledKeyboardNavigation
        />
        <Button color="neutral" variant="soft" onClick={() => setFilters({})}>
          Clear filters
        </Button>
        {data.length} results
      </Flex>
      <Flex
        sx={{ overflowX: "auto", pb: 2, height: "calc(100vh - 180px)", position: "relative" }}
        ref={tableRef}
        className="scrollable-table"
      >
        {showRightButton && <CustomNavigateNext onClick={scrollRight} />}
        {showLeftButton && <CustomNavigateBefore onClick={scrollLeft} />}
        <Table>
          <colgroup>
            {TABLE_HEADER.map((item) => (
              <col key={item.key} style={{ width: item.width }} />
            ))}
          </colgroup>
          <thead className="sticky-table-header">
            <tr>
              {TABLE_HEADER.map((item) => (
                <th key={item.key} onClick={handleSortChange(item.key as SORT_FIELDS)}>
                  <Flex x yc sx={{ cursor: item.sortable ? "pointer" : "text" }}>
                    {item.label}
                    {renderSortable(item)}
                  </Flex>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((loanRequest) => {
              return (
                <EntryWrapper
                  key={loanRequest.id}
                  height={50}
                  sx={{
                    "& td": { lineHeight: "20px" },
                  }}
                  data-id={loanRequest.id}
                  wrapperComponent={"tr"}
                  render={() => <LeadEntry refetch={loanRequests.refetch} loanRequest={loanRequest} />}
                />
              );
            })}
          </tbody>
        </Table>
      </Flex>
    </Flex>
  );
};
