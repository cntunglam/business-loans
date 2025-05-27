import { ExpandMore, ViewWeekOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Typography,
} from "@mui/joy";
import { getLoanRequestsSchema } from "@roshi/backend";
import { useEffect, useMemo, useState } from "react";
// import { useSearchParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useGetClosedLoanRequests, useGetLoanRequests } from "../api/useLoanRequestApi";
import ArrowRightIcon from "../components/icons/arrowRightIcon";
import CalendarTickIcon from "../components/icons/calendarTickIcon";
import { AppointmentScheduled } from "../components/lenderDashboard/AppointmentScheduled";
import { MobileTable } from "../components/lenderDashboard/mobileTable";
import {
  acceptedOffersColumns,
  approvedColumns,
  closedOffersColumns,
  ColumnKeys,
  newColumns,
  rejectedColumns,
} from "../components/lenderDashboard/tableColumns/lenderDashboardColumns";
import { Flex } from "../components/shared/flex";
import { LoadingPage } from "../components/shared/loadingPage";
import RSGestureDetector, { type GestureType } from "../components/shared/rsGestureHandler";
import RSTable from "../components/shared/rsTable";
import useMediaQueries from "../hooks/useMediaQueries";
import useStatePersisted from "../hooks/useStatePersisted";

const DEFAULT_PAGE_SIZE = 10;

type Tabs = z.infer<typeof getLoanRequestsSchema>["tab"];
const TABS_TO_COLUMNS_KEY_LABEL: Record<Tabs | "closed", { key: string; title: string }[]> = {
  "offer-accepted": [...acceptedOffersColumns],
  approved: [...approvedColumns],
  new: [...newColumns],
  rejected: [...rejectedColumns],
  closed: [...closedOffersColumns],
} as const;

//Closed is treated separately as signature is different
const TABS_TO_COLUMNS = {
  approved: approvedColumns,
  "offer-accepted": acceptedOffersColumns,
  new: newColumns,
  rejected: rejectedColumns,
} as const;

export const LenderDashboardView = () => {
  // State Variables
  const { md } = useMediaQueries(["md"]);
  const [selectedRecord, setSelectedRecord] = useState(1);
  const [searchParams] = useSearchParams();
  const tab = (() => {
    const tab = searchParams.get("tab");
    if (tab === "all" || !tab) return "new";
    return tab;
  })();

  // const searchingId = searchParams.get("loanRequest");
  const [scheduled, setScheduled] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [hiddenColumns, setHiddenColumns] = useStatePersisted<ColumnKeys[]>("lenderDashboard.hiddenColumns", []);
  const [currMonthOrLast, setCurrMonthOrLast] = useState<"current" | "previous">("current");

  const closedLoanRequestsQuery = useGetClosedLoanRequests(
    { month: currMonthOrLast, page },
    { enabled: tab === "closed" }
  );

  const loanRequestsQuery = useGetLoanRequests({ page, tab: tab as Tabs }, { enabled: tab !== "closed" });

  const currentQuery = tab === "closed" ? closedLoanRequestsQuery : loanRequestsQuery;

  const toggleColumnVisibility = (columnKey: ColumnKeys) => {
    setHiddenColumns((prev) =>
      prev.includes(columnKey) ? prev.filter((key) => key !== columnKey) : [...prev, columnKey]
    );
  };

  const ColumnVisibilityMenu = () => (
    <Dropdown>
      {!md ? (
        <MenuButton slots={{ root: IconButton }} slotProps={{ root: { variant: "outlined", color: "neutral" } }}>
          <ViewWeekOutlined />
        </MenuButton>
      ) : (
        <MenuButton sx={{ color: "neutral.500", width: "246px", justifyContent: "space-between" }}>
          <Typography level="body-sm" sx={{ color: "#999999", fontWeight: 400 }}>
            Select columns to hide
          </Typography>
          <ExpandMore />
        </MenuButton>
      )}
      {tab && (
        <Menu sx={{ maxHeight: "50dvh", overflowY: "auto" }}>
          {TABS_TO_COLUMNS_KEY_LABEL[tab as keyof typeof TABS_TO_COLUMNS_KEY_LABEL]
            .filter((i) => i.key !== "action")
            .map((col) => (
              <MenuItem key={col.key}>
                <Checkbox
                  checked={!hiddenColumns.includes(col.key as ColumnKeys)}
                  onChange={() => toggleColumnVisibility(col.key as ColumnKeys)}
                  label={col.title}
                />
              </MenuItem>
            ))}
        </Menu>
      )}
    </Dropdown>
  );

  const monthSelectionButtons = tab === "closed" && (
    <Flex x xc yc bgcolor={"common.white"}>
      <ButtonGroup variant={"solid"} size="md" sx={{ border: "1px solid", borderColor: "neutral.800" }}>
        <Button
          color={currMonthOrLast === "current" ? "primary" : "white"}
          onClick={() => setCurrMonthOrLast("current")}
          sx={{ border: 0 }}
        >
          Current Month
        </Button>
        <Button
          color={currMonthOrLast === "previous" ? "primary" : "white"}
          onClick={() => setCurrMonthOrLast("previous")}
          sx={{ border: 0 }}
        >
          Last Month
        </Button>
      </ButtonGroup>
    </Flex>
  );

  const { hasNext, hasPrevious } = useMemo(() => {
    return {
      hasPrevious: selectedRecord > 1,
      hasNext: selectedRecord !== currentQuery?.data?.meta?.totalItems,
    };
  }, [selectedRecord, currentQuery]);

  const handleGesture = (gesture: GestureType) => {
    switch (gesture) {
      case "swipeLeft":
        hasNext && setSelectedRecord(selectedRecord + 1);
        break;
      case "swipeRight":
        hasPrevious && setSelectedRecord(selectedRecord - 1);
        break;
    }
  };

  // useEffect(() => {
  //   setPage(1);
  //   setSelectedRecord(1);
  // }, [md, searchingId, tab]);

  useEffect(() => {
    if (!md) {
      const calculatedPage = parseInt(`${(selectedRecord - 1) / DEFAULT_PAGE_SIZE + 1}`);

      if (page !== calculatedPage) {
        setPage(calculatedPage);
      }
    }
  }, [md, page, selectedRecord]);

  return (
    <Flex y xc>
      <LoadingPage isLoading={!currentQuery.isFetchedAfterMount} variant="overlay" />
      {scheduled && <AppointmentScheduled onClose={() => setScheduled(false)} />}

      <Box sx={{ width: "100%", backgroundColor: "neutral.softBg", display: { xs: "block", md: "none" } }}>
        <Flex
          x
          xsb
          yc
          px={2}
          py={1}
          sx={{ backgroundColor: "common.white", borderBottom: "1px solid", borderBottomColor: "neutral.300" }}
          position={"sticky"}
          top={0}
          zIndex={1}
        >
          <Typography>{currentQuery?.data?.meta?.totalItems} items</Typography>
          <Flex x yc gap1>
            <ColumnVisibilityMenu />
            <Flex x xsb yc sx={{ borderRadius: "8px", border: "1px solid", borderColor: "neutral.300" }}>
              <IconButton size="sm" disabled={!hasPrevious} onClick={() => setSelectedRecord(selectedRecord - 1)}>
                <ArrowRightIcon sx={{ transform: "rotate(180deg)" }} />
              </IconButton>
              <Typography level="body-sm" textColor={"common.black"}>
                {!currentQuery?.data?.meta?.totalItems ? 0 : selectedRecord} /{" "}
                <Typography textColor="neutral.500">{currentQuery?.data?.meta?.totalItems}</Typography>
              </Typography>
              <IconButton size="sm" disabled={!hasNext} onClick={() => setSelectedRecord(selectedRecord + 1)}>
                <ArrowRightIcon />
              </IconButton>
            </Flex>
          </Flex>
        </Flex>
        {monthSelectionButtons}
        <RSGestureDetector onGesture={handleGesture}>
          {tab === "closed" ? (
            <MobileTable
              data={closedLoanRequestsQuery.data?.data}
              columns={closedOffersColumns.filter((col) => !hiddenColumns.includes(col.key as ColumnKeys))}
              currentItem={selectedRecord}
            />
          ) : (
            <MobileTable
              data={loanRequestsQuery.data?.data}
              columns={TABS_TO_COLUMNS[tab as Tabs].filter((col) => !hiddenColumns.includes(col.key as ColumnKeys))}
              currentItem={selectedRecord}
            />
          )}
        </RSGestureDetector>
      </Box>

      <Box
        sx={{
          width: "100%",
          backgroundColor: "common.white",
          px: 2,
          my: 1,
          display: { xs: "none", md: "block" },
          // boxShadow: "md",
        }}
      >
        <Flex x xsb>
          <Flex />
          {/* <Input
            sx={{
              padding: "9px 12px",
              borderRadius: "6px",
              border: "1px solid #DFDFDF",
              width: "234px",
              backgroundColor: "white",
              fontSize: "14px",
            }}
            startDecorator={<SearchIcon />}
            value={searchParams.get("loanRequest") || ""}
            onChange={(e) => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set("loanRequest", e.target.value);
              setSearchParams(newParams);
            }}
            placeholder="Find application by ID"
          /> */}
          {monthSelectionButtons}
          <Flex x xe gap1>
            <Box
              sx={{
                display: "flex",
                background: "white",
                border: "1px solid #DFDFDF",
                padding: "10px",
                borderRadius: "6px",
              }}
              onClick={() => {
                setScheduled(true);
              }}
            >
              <CalendarTickIcon sx={{ color: "primary.500" }} />
            </Box>
            <ColumnVisibilityMenu />
          </Flex>
        </Flex>
        {tab === "closed" ? (
          <RSTable
            data={closedLoanRequestsQuery.data?.data}
            columns={closedOffersColumns.filter((col) => !hiddenColumns.includes(col.key as ColumnKeys))}
            pagination={{
              currentPage: page,
              itemsPerPage: 10,
              totalItems: currentQuery?.data?.meta?.totalItems || 0,
              onPageChange: (page) => setPage(page),
            }}
          />
        ) : (
          <RSTable
            data={loanRequestsQuery.data?.data}
            columns={TABS_TO_COLUMNS[tab as keyof typeof TABS_TO_COLUMNS].filter(
              (col) => !hiddenColumns.includes(col.key as ColumnKeys)
            )}
            pagination={{
              currentPage: page,
              itemsPerPage: 10,
              totalItems: currentQuery?.data?.meta?.totalItems || 0,
              onPageChange: (page) => setPage(page),
            }}
          />
        )}
      </Box>
    </Flex>
  );
};
