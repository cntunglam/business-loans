import { Circle } from "@mui/icons-material";
import { Typography } from "@mui/joy";
import { NonNullRT } from "@roshi/shared";
import { FC } from "react";
import { useGetAllConversations } from "../../api/useWhatsappApi";
import { getDifference } from "../../utils/utils";
import { CustomerSupportChip } from "../shared/customersupportChip";
import { Flex } from "../shared/flex";
import { RsEllipsis } from "../shared/rsEllipsis";

interface Props {
  conv: NonNullRT<typeof useGetAllConversations>[0];
  selectedTarget?: string;
  setSelectedTarget: (targetId: string, targetType: "group" | "user") => void;
}

const customerSupportChipClassName = "customer-support-chip";

export const ConversationEntry: FC<Props> = ({ conv, selectedTarget, setSelectedTarget }) => {
  return (
    <Flex
      sx={{
        backgroundColor: selectedTarget === conv.targetId ? "background.body" : "",
        minHeight: "100%",
        width: "calc(100% + 2px)",
        mx: "-1px",
        border: "1px solid",
        borderColor: "divider",
        borderRight: "none",
        [`&:hover:not(:has(.${customerSupportChipClassName}:hover))`]: {
          backgroundColor: "neutral.100",
        },
      }}
      y
      key={conv.id}
      p={2}
      py={1}
      pointer
      onClick={() => {
        setSelectedTarget(conv.targetId, conv.type as "group" | "user");
        if (conv.lastMessage) conv.lastMessage.isRead = true;
      }}
      fullwidth
    >
      <Flex x xsb>
        <Flex x gap1 yc>
          <Typography level="title-md" sx={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
            {conv.name}
            {!conv.lastMessage?.isRead && <Circle sx={{ fontSize: "0.6rem", ml: 1 }} color="primary" />}
          </Typography>
        </Flex>
        <Typography level="body-sm">{getDifference(conv.lastMessage?.createdAt)} ago</Typography>
      </Flex>
      <Flex x yc gap1>
        {conv.loanRequestId && (
          <CustomerSupportChip
            customerSupport={conv.customerSupport}
            loanRequestId={conv.loanRequestId || ""}
            className={customerSupportChipClassName}
          />
        )}
        {conv.note && (
          <RsEllipsis text={conv.note} maxLines={1} sx={{ fontSize: "sm", fontWeight: 500, color: "secondary.400" }} />
        )}
      </Flex>
      <Typography
        fontWeight="500"
        level="body-sm"
        textColor={"neutral.500"}
        sx={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}
      >
        {conv.lastMessage?.text ||
          conv.lastMessage?.imageUrl?.replace("https://cdn.pickyassist.com/uploads/images/", "")}
      </Typography>
    </Flex>
  );
};
