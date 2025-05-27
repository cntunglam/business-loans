import { Button, Table } from "@mui/joy";
import { ERROR_KEYS, LogLevel, LogSource } from "@roshi/shared";
import { useGetAllLogs } from "../../api/useLoggerApi";
import { Flex } from "../shared/flex";
import { LoadingPage } from "../shared/loadingPage";
import { LoadMoreButton } from "../shared/loadMoreButton";
import { RsSelect } from "../shared/rsSelect";
import { LogEntry } from "./logEntry";

const TABLE_HEADER: { key: string; label: string; sortable?: boolean; width: string }[] = [
  { key: "createdAt", label: "Created At", width: "100px", sortable: true },
  { key: "source", label: "Source", width: "50px" },
  { key: "errorType", label: "Type", width: "80px" },
  { key: "level", label: "Level", sortable: true, width: "60px" },
  { key: "message", label: "Message", width: "80px" },
  { key: "stack", label: "Stack", sortable: true, width: "150px" },
  { key: "request", label: "Request", width: "150px" },
];

export const AppLogsTable = () => {
  const [query, params, setParams, clearParams] = useGetAllLogs();
  const logsData = query?.data;

  return (
    <Flex y>
      <LoadingPage variant="overlay" isLoading={query?.isLoading} />

      <Flex x yc gap1 py={1} wrap>
        <RsSelect
          placeholder="Source"
          sx={{ width: "200px" }}
          value={params.source || null}
          values={Object.keys(LogSource).map((key) => LogSource[key as keyof typeof LogSource])}
          setValue={(val) =>
            setParams({
              ...params,
              source: val ? (val as LogSource) : undefined,
            })
          }
        />
        <RsSelect
          placeholder="Level"
          sx={{ width: "200px" }}
          value={params.level || null}
          values={Object.keys(LogLevel).map((key) => LogLevel[key as keyof typeof LogLevel])}
          setValue={(val) =>
            setParams({
              ...params,
              level: val ? (val as LogLevel) : undefined,
            })
          }
        />
        <RsSelect
          placeholder="Error Type"
          sx={{ width: "200px" }}
          value={params.errorType || null}
          values={Object.keys(ERROR_KEYS).map((key) => ERROR_KEYS[key as keyof typeof ERROR_KEYS])}
          setValue={(val) =>
            setParams({
              ...params,
              errorType: val ? (val as ERROR_KEYS) : undefined,
            })
          }
        />
        <Button color="neutral" variant="soft" onClick={() => clearParams()}>
          Clear filters
        </Button>
        {logsData?.length} results
      </Flex>
      <Flex sx={{ overflowX: "auto", pb: 2, position: "relative" }}>
        <Table>
          <colgroup>
            {TABLE_HEADER.map((item) => (
              <col key={item.key} style={{ width: item.width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {TABLE_HEADER.map((item) => (
                <th key={item.key}>
                  <Flex x yc sx={{ cursor: item.sortable ? "pointer" : "text" }}>
                    {item.label}
                  </Flex>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{logsData?.map((log) => <LogEntry key={`logs-item-${log.id}`} log={log} />)}</tbody>
        </Table>
      </Flex>
      <LoadMoreButton query={query} />
    </Flex>
  );
};
