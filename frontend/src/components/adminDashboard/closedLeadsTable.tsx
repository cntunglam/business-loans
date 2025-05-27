import { Button, Input, Option, Select, Table } from "@mui/joy";
import { CompanyStatusEnum, CompanyTypeEnum, CountriesEnum } from "@roshi/shared";
import { useEffect } from "react";
import { useGetAllClosedLeads, useGetCompanies } from "../../api/useAdminApi";
import { Flex } from "../shared/flex";
import { LoadingPage } from "../shared/loadingPage";
import { RsInputDatePicker } from "../shared/rsInuputDatePicker";
import { ClosedLeadEntry } from "./closedLeadEntry";

export const ClosedLeadsTable = () => {
  const {
    query: { data: closedResponses, isLoading, refetch },
    params,
    setParams,
    clearParams,
  } = useGetAllClosedLeads({ country: CountriesEnum.SG });
  const { data: companies } = useGetCompanies({
    filters: {
      country: CountriesEnum.SG,
      status: CompanyStatusEnum.ACTIVE,
      type: CompanyTypeEnum.MONEYLENDER,
    },
  });

  useEffect(() => {
    setParams({ month: new Date().toISOString() });
  }, []);

  return (
    <Flex y gap1>
      <LoadingPage isLoading={isLoading} variant="overlay" />
      <Flex x yc py={1} gap1 wrap>
        <Input
          placeholder="Search by ID"
          value={params?.id || ""}
          onChange={(e) => setParams({ id: e.target.value })}
        />
        <Input
          placeholder="Search by name"
          value={params?.name || ""}
          onChange={(e) => setParams({ name: e.target.value })}
        />
        <Select
          placeholder="Filter by company"
          onChange={(_, val) => setParams({ companyId: val as string })}
          value={params?.companyId}
        >
          {companies?.map((company) => (
            <Option key={company.id} value={company.id}>
              {company.name}
            </Option>
          ))}
        </Select>
        <RsInputDatePicker
          disableCustomHeader
          showMonthYearPicker
          selected={params?.month ? new Date(params.month) : undefined}
          dateFormat="MM/yyyy"
          onChange={(date) => setParams({ month: date?.toISOString() || undefined })}
          customInput={<Input placeholder="Filter by month" sx={{ width: "150px" }} />}
        />
        <Button color="neutral" variant="soft" onClick={() => clearParams()}>
          Clear filters
        </Button>
        {closedResponses?.length} results
      </Flex>
      <Flex sx={{ overflowX: "auto" }}>
        <Table>
          <thead>
            <tr>
              <th style={{ width: "120px" }}>closed on</th>
              <th style={{ width: "120px" }}>created on</th>
              <th style={{ width: "120px" }}>Amount</th>
              <th style={{ width: "150px" }}>ID</th>
              <th style={{ width: "200px" }}>name</th>
              <th style={{ width: "120px" }}>lender</th>
              <th style={{ width: "120px" }}>Customer support</th>
              <th style={{ width: "120px" }}>note</th>
              <th style={{ width: "60px", textAlign: "center" }}>Google Review</th>
              <th style={{ minWidth: "60px", width: "100%", textAlign: "center" }}>Cashback</th>
            </tr>
          </thead>
          <tbody>{closedResponses?.map((resp) => <ClosedLeadEntry entry={resp} refetch={refetch} />)}</tbody>
        </Table>
      </Flex>
    </Flex>
  );
};
