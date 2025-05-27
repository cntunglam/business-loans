import { SearchOff } from "@mui/icons-material";
import { useMemo } from "react";
import { useGetMlcbReport } from "../../api/useAdminApi";
import { Flex } from "../shared/flex";
import { LoadingPage } from "../shared/loadingPage";
import { PageMessage } from "../shared/pageMessage";
import { RsModal } from "../shared/rsModal";
import { MlcbReportEntry } from "./mlcbReportEntry";

export const MlcbReportModal = ({ loanRequestId, onClose }: { loanRequestId: string; onClose: () => void }) => {
  const { data: report, isLoading } = useGetMlcbReport(loanRequestId);
  const loans = useMemo(() => {
    if (!report) return [];
    let loans = report.response_report.MESSAGE.ITEM.MLCB_REPORT.APPLICANT.PAYMENTSTS?.LOAN || [];
    if (!Array.isArray(loans)) loans = [loans];
    return loans;
  }, [report]);

  return (
    <RsModal onClose={onClose} title="MLCB Report">
      <LoadingPage variant="overlay" isLoading={isLoading} />
      {!report ? (
        <PageMessage text="No report for this loan request" icon={<SearchOff />} />
      ) : (
        <Flex y>
          {loans.length === 0 ? (
            <PageMessage text="MLCB report contains no loans" icon={<SearchOff />} />
          ) : (
            <Flex y gap3 sx={{ overflowX: "auto" }} p={2}>
              {loans.map((item) => (
                <MlcbReportEntry entry={item} />
              ))}
            </Flex>
          )}
        </Flex>
      )}
    </RsModal>
  );
};
