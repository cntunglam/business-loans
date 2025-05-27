import { Box, Table } from "@mui/joy";
import { ActivityLogEnum, ActivityLogEnumLabels, hasCustomerSupportPermissions, UserRoleEnum } from "@roshi/shared";
import { FC, useCallback, useMemo } from "react";

import { useGetActivityLogs } from "../../api/useLoanRequestApi";
import { useGetLoanResponseByIds } from "../../api/useLoanResponseApi";
import { formattedDate } from "../../utils/utils";
import { Flex } from "../shared/flex";
import { LoadingPage } from "../shared/loadingPage";
import { RsModal } from "../shared/rsModal";

interface Props {
  loanRequestId: string;
  onClose: () => void;
}

export const ActivityLogsModal: FC<Props> = ({ loanRequestId, onClose }) => {
  const { data: activityLogs = [], isLoading } = useGetActivityLogs(loanRequestId);

  // handle for appointment set and canceled logs
  const loanResponseIds = useMemo(
    () =>
      activityLogs
        .filter(
          (log) =>
            log.activityType === ActivityLogEnum.APPOINTMENT_SET ||
            log.activityType === ActivityLogEnum.APPOINTMENT_CANCELED
        )
        .map((log) => log.targetId)
        .filter((id) => typeof id === "string"),
    [activityLogs]
  );

  const { data: loanResponses } = useGetLoanResponseByIds(loanResponseIds);

  const loanResponseMapping = useMemo(() => {
    if (!loanResponses) return {};
    return loanResponses?.data?.reduce(
      (acc, loanResponse) => {
        acc[loanResponse.id] = loanResponse;
        return acc;
      },
      {} as Record<string, (typeof loanResponses.data)[number]>
    );
  }, [loanResponses]);

  const getLenderName = useCallback(
    (log: (typeof activityLogs)[number]) => {
      if (!log.targetId) return;
      const loanResponse = loanResponseMapping[log.targetId!];
      const lenderName = loanResponse?.lender?.name;

      switch (log.activityType) {
        case ActivityLogEnum.APPOINTMENT_SET:
        case ActivityLogEnum.APPOINTMENT_CANCELED:
          if (lenderName) {
            return (
              <>
                with &nbsp;<b>{lenderName}</b>
              </>
            );
          }
          return;
        default:
          return;
      }
    },
    [loanResponseMapping]
  );
  // end of handle for appointment set and canceled logs

  const getName = (user: (typeof activityLogs)[number]["user"]) => {
    if (!user) return "SYSTEM";
    if (user?.role === UserRoleEnum.LENDER) return user.company?.name;
    else if (hasCustomerSupportPermissions(user?.role)) return `${user.name}`;
    else return "BORROWER";
  };

  const renderContent = (log: (typeof activityLogs)[number]) => {
    return (
      <Flex y>
        <Flex x>
          <b>{getName(log.user)}</b>&nbsp;
          {ActivityLogEnumLabels[log.activityType as ActivityLogEnum]}&nbsp;
          {log.activityType === ActivityLogEnum.CONTACTED && (
            <b>{log.user?.role === UserRoleEnum.BORROWER ? UserRoleEnum.LENDER : UserRoleEnum.BORROWER}</b>
          )}
          &nbsp;
          {getLenderName(log)}
          {/* <Link to={viewLogDetails(log)} target="_blank">
            See more.
          </Link> */}
        </Flex>
      </Flex>
    );
  };
  return (
    <RsModal onClose={onClose}>
      {isLoading && <LoadingPage variant="overlay" />}

      <Box sx={{ overflow: "auto" }}>
        <Table sx={{ minWidth: 900 }}>
          <thead>
            <tr>
              <th style={{ width: "25%" }}>Time</th>
              {/* <th style={{ width: "10%" }}>User type</th>
              <th style={{ width: "15%" }}>Name</th> */}
              <th style={{ width: "50%" }}>Activity</th>
            </tr>
          </thead>

          <tbody>
            {activityLogs?.map((log) => {
              return (
                <tr key={log.id}>
                  <td>{log?.createdAt ? formattedDate(log?.createdAt) : "-"}</td>
                  {/* <td>{log.user?.role}</td>
                  <td>{log.user?.name || log.user?.role}</td> */}
                  <td>{renderContent(log)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Box>
    </RsModal>
  );
};
