import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import { Button, Table } from "@mui/joy";
import React, { useCallback, useState } from "react";
import { ReferralLink } from "../../api/useAffiliateApi";
import { useScrollableTable } from "../../hooks/useScrollableTable";
import { CustomNavigateBefore, CustomNavigateNext } from "../shared/customerNavigateButton ";
import { EntryWrapper } from "../shared/entryWrapper";
import { Flex } from "../shared/flex";
import { ReferralLinkEntry } from "./referralLinkEntry";

const TABLE_HEADER: { key: string; label: string; sortable?: boolean; width: string }[] = [
  { key: "name", label: "Name", width: "100px" },
  { key: "link", label: "Link", width: "300px" },
  { key: "shortUrl", label: "Short URL", width: "120px" },
  { key: "visits", label: "Visits", width: "100px" },
  { key: "applications", label: "Applications", width: "130px" },
  { key: "closedLoanRequests", label: "Closed Loan Requests", width: "130px" },
  { key: "createdAt", label: "Created At", sortable: true, width: "120px" },
  { key: "actions", label: "Actions", width: "100px" },
];

type SORT_FIELDS = "createdAt" | "visits" | "applications";
type SORT_TYPE = "desc" | "asc";

type Props = {
  onAddReferralLink: () => void;
  referralLinks: ReferralLink[];
  refetch: () => void;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  search: string;
};

export const ReferralLinkTable = ({
  onAddReferralLink,
  referralLinks,
  refetch,
  // handleSearch, search
}: Props) => {
  const [sortCol, setSortCol] = useState<SORT_FIELDS>("createdAt");
  const [sortOrd, setSortOrd] = useState<SORT_TYPE>("desc");
  const { tableRef, showLeftButton, showRightButton, scrollLeft, scrollRight } = useScrollableTable(false);

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

  return (
    <Flex y>
      {/* <LoadingPage variant="overlay" isLoading={loanRequests.isLoading} /> */}

      <Flex x yc gap1 py={1} wrap>
        {/* <Input
          placeholder="Search by Name"
          value={search}
          onChange={handleSearch}
          sx={{ width: "150px", "& input": { fontSize: "14px" } }}
        />
        <Button color="neutral" variant="soft" onClick={() => {}}>
          Clear filters
        </Button>
        <Typography level="body-sm"> {referralLinks?.length} results</Typography> */}
        <Button color="primary" variant="soft" onClick={onAddReferralLink}>
          Create
        </Button>
      </Flex>
      <Flex sx={{ overflowX: "auto", pb: 2, position: "relative" }} ref={tableRef} className="scrollable-table">
        {showRightButton && <CustomNavigateNext onClick={scrollRight} />}
        {showLeftButton && <CustomNavigateBefore onClick={scrollLeft} />}
        <Table sx={{ width: "100%" }}>
          <colgroup>
            {TABLE_HEADER.map((item) => (
              <col key={item.key} style={{ width: item.width }} />
            ))}
          </colgroup>
          <thead>
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
            {referralLinks?.map((referralLink: ReferralLink) => (
              <EntryWrapper
                key={referralLink.id}
                height={50}
                sx={{ "& td": { lineHeight: "20px" } }}
                wrapperComponent={"tr"}
                render={() => <ReferralLinkEntry key={referralLink.id} refetch={refetch} referralLink={referralLink} />}
              />
            ))}
          </tbody>
        </Table>
      </Flex>
    </Flex>
  );
};
