import { TabPanel, Tabs, Typography } from "@mui/joy";
import { ReactNode } from "react";
import { useTranslation } from 'react-i18next';
import { useSearchParams } from "react-router-dom";
import { useGetMyLoanRequest } from "../api/useLoanRequestApi";
import { Flex } from "../components/shared/flex";
import { DocumentList } from "../components/userDashboard/documentList";

export const UserDocumentsView = () => {
  const { data, refetch } = useGetMyLoanRequest();
  const [params, setParams] = useSearchParams();
  const { t } = useTranslation();

  const DocumentUploadHeader = ({ text, children }: { text: string; children?: ReactNode }) => {
    return (
      <Flex y xc fullwidth gap3 pt={2} pb={4}>
        <Flex y xc gap={0.5}>
          <Typography level="h3">{t("form:documentview.supporting")}</Typography>
          <Typography level="body-md" textAlign={"center"}>
            {text}
          </Typography>
        </Flex>
        {children}
      </Flex>
    );
  };

  return (
    <Flex fullwidth y px={{ xs: 1, md: 4 }} gap2>
      <Typography level="h3" fontWeight={"700"} color="secondary">
       {t("form:documentview.upload")}
      </Typography>
      <Tabs
        value={params.get("tab") || "personal"}
        sx={{ py: 3 }}
        onChange={(_, newTab) => newTab !== null && setParams({ tab: newTab.toString() })}
      >
        <TabPanel
          value={"personal"}
          sx={{
            backgroundColor: "neutral.50",
            boxShadow: { xs: "none", md: "md" },
            marginY: 2,
            padding: { xs: 1, md: 4 },
            borderRadius: "md",
          }}
        >
          <DocumentUploadHeader text={t("form:documentview.text")} />
          <DocumentList applicantInfo={data?.applicantInfo} refetch={refetch} />
        </TabPanel>
      </Tabs>
    </Flex>
  );
};
