import { Drawer, useTheme } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetAllConversations } from "../api/useWhatsappApi";
import { Conversation } from "../components/chatDashboard/conversation";
import { ConversationsList } from "../components/chatDashboard/conversationsList";
import { GroupConversation } from "../components/chatDashboard/groupConversation";
import { FlexGrid } from "../components/shared/flexGrid";
import { CONSTANTS } from "../data/constants";

export const ChatDashboardView = () => {
  const theme = useTheme();
  const { data: conversations, refetch } = useGetAllConversations();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const targetId = searchParams.get("targetId");
  const targetType = searchParams.get("targetType") as "group" | "user";

  useEffect(() => {
    if (!targetId || !targetType) setIsDrawerOpen(true);
  }, [isDrawerOpen, targetId, targetType]);

  useEffect(() => {
    const intervalId = setInterval(() => refetch(), 5000);
    return () => clearInterval(intervalId);
  }, [refetch]);

  const selectedTarget = useMemo(() => {
    if (!targetId) return null;
    const conversation = conversations?.find((conv) => conv.type === targetType && conv.targetId === targetId);
    if (conversation) {
      if (!conversation.roshiPhone) conversation.roshiPhone = CONSTANTS.WA_PHONE_NUMBER;
      return conversation;
    }
    return {
      targetId: targetId!,
      roshiPhone: CONSTANTS.WA_PHONE_NUMBER as string,
      type: targetType || "group",
      name: targetId || "",
    };
  }, [conversations, targetId, targetType]);

  return (
    <FlexGrid container grow sx={{ backgroundColor: "background.level2" }}>
      <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} sx={{ display: { xs: "block", md: "none" } }}>
        <FlexGrid md={3.5} y grow sx={{ borderRight: "1px solid " + theme.palette.divider }}>
          <ConversationsList
            selectedTarget={targetId || undefined}
            conversations={conversations}
            setSelectedTarget={(targetId: string, targetType: string) => {
              setIsDrawerOpen(false);
              setSearchParams({ targetId, targetType });
            }}
          />
        </FlexGrid>
      </Drawer>
      <FlexGrid
        md={3.5}
        y
        grow
        sx={{ borderRight: "1px solid " + theme.palette.divider, display: { xs: "none", md: "block" } }}
      >
        <ConversationsList
          selectedTarget={targetId || undefined}
          conversations={conversations}
          setSelectedTarget={(targetId: string, targetType: string) => {
            setIsDrawerOpen(false);
            setSearchParams({ targetId, targetType });
          }}
        />
      </FlexGrid>
      {selectedTarget && (
        <FlexGrid xs sx={{ borderRight: "1px solid " + theme.palette.divider }}>
          {targetType === "group" ? (
            <GroupConversation openDrawer={() => setIsDrawerOpen(true)} refetchAll={refetch} group={selectedTarget} />
          ) : (
            <Conversation openDrawer={() => setIsDrawerOpen(true)} refetchAll={refetch} user={selectedTarget} />
          )}
        </FlexGrid>
      )}
    </FlexGrid>
  );
};
