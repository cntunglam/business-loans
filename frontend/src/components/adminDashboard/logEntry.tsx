import { Chip } from "@mui/joy";
import { AppLogs, LogLevel, LogLevelColors } from "@roshi/shared";
import { formatDistance } from "date-fns";
import { FC } from "react";
import { RsEllipsis } from "../shared/rsEllipsis";

interface Props {
  log: AppLogs;
}

export const LogEntry: FC<Props> = ({ log }) => {
  return (
    <tr key={`logs-item-${log.id}`}>
      <td>{formatDistance(log.createdAt, new Date(), { addSuffix: true })}</td>
      <td>{log.source}</td>
      <td>{log.errorType}</td>
      <td>
        <Chip color={LogLevelColors[log.level as LogLevel]}>{log.level}</Chip>
      </td>
      <td>{log.message}</td>
      <td>
        <RsEllipsis text={log.stack || ""} maxLines={1} />
      </td>
      <td>
        <pre style={{ maxWidth: "300px", overflow: "auto" }}>{JSON.stringify(log.request, undefined, 2)}</pre>
      </td>
    </tr>
  );
};
