import { Box, Button, Divider, Input, Typography } from "@mui/joy";
import { NonNullRT } from "@roshi/shared";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useGetAllConversations } from "../../api/useWhatsappApi";
import { useUserContext } from "../../context/userContext";
import { EntryWrapper } from "../shared/entryWrapper";
import { Flex } from "../shared/flex";
import { ConversationEntry } from "./conversationEntry";

interface Props {
  conversations?: NonNullRT<typeof useGetAllConversations>;
  setSelectedTarget: (targetId: string, targetType: "group" | "user") => void;
  selectedTarget?: string;
}

const FilterButton = ({ enabled, label, onClick }: { enabled: boolean; label: string; onClick: () => void }) => {
  return (
    <Button
      variant={enabled ? "solid" : "outlined"}
      color={enabled ? "primary" : "secondary"}
      size="sm"
      onClick={onClick}
    >
      {label}
    </Button>
  );
};

export const ConversationsList: FC<Props> = ({ conversations, selectedTarget, setSelectedTarget }) => {
  const audio = useRef<HTMLAudioElement>();
  const [search, setSearch] = useState("");
  const [lastMsgTime, setLastMsgTime] = useState<number>();
  const { user } = useUserContext();

  const [filters, setFilters] = useState<{
    isUnread: boolean;
    isWaitingForReply: boolean;
  }>({
    isUnread: false,
    isWaitingForReply: false,
  });

  useEffect(() => {
    if (conversations) {
      const currentLastMessage = conversations
        .flatMap((conv) => ("phone" in conv ? conv.sentMessages : conv.messages) || [])[0]
        .createdAt.getTime();
      if (lastMsgTime && currentLastMessage > lastMsgTime) {
        audio.current?.play();
      }
      setLastMsgTime(currentLastMessage);
    }
  }, [conversations, lastMsgTime]);

  useEffect(() => {
    audio.current = new Audio("/audio/chat-notification.mp3");
    audio.current.volume = 0.5;
  }, []);

  const filteredConversations = useMemo(() => {
    const processedSearch = search.toLowerCase().trim().replace(/^\+/, "");

    let results = conversations?.filter((conv) => {
      return "phone" in conv
        ? conv.waName?.toLowerCase().includes(processedSearch) ||
            conv.user?.name?.toLowerCase().includes(processedSearch) ||
            conv.phone.includes(processedSearch)
        : conv.members.some(
            (member) =>
              member.waName?.toLowerCase().includes(processedSearch) ||
              member.user?.name?.toLowerCase().includes(processedSearch) ||
              member.phone.includes(processedSearch)
          );
    });
    if (filters.isUnread) {
      results = results?.filter(({ lastMessage }) => !lastMessage?.isRead);
    }
    if (filters.isWaitingForReply) {
      results = results?.filter(
        ({ lastMessage }) => lastMessage?.createdById && `${lastMessage?.createdById}` === `${user?.id}`
      );
    }
    return results;
  }, [conversations, search, filters, user?.id]);

  const onChangeFilters = (key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <Flex x xsb yc px={1} height={"50px"} gap2>
        <Typography level="title-md">Conversations</Typography>
        <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Flex>
      <Flex x wrap gap1 px={1} mb={1}>
        <FilterButton
          label="Unread"
          enabled={filters.isUnread}
          onClick={() => {
            onChangeFilters("isUnread");
          }}
        />
        <FilterButton
          label="Waiting For Reply"
          enabled={filters.isWaitingForReply}
          onClick={() => {
            onChangeFilters("isWaitingForReply");
          }}
        />
      </Flex>
      <Divider />
      <Box sx={{ overflowX: "hidden", overflowY: "auto", maxHeight: "calc(100vh - 120px)" }}>
        <Flex y xst>
          {filteredConversations?.length ? (
            filteredConversations?.map((conv) => (
              <EntryWrapper
                sx={{ width: "100%" }}
                key={conv.id}
                height={99}
                render={() => (
                  <ConversationEntry
                    conv={conv}
                    selectedTarget={selectedTarget}
                    setSelectedTarget={setSelectedTarget}
                  />
                )}
              />
            ))
          ) : (
            <Flex p={2} textAlign={"center"} width={"100%"} sx={{ justifyContent: "center" }}>
              There is no message to show.
            </Flex>
          )}
        </Flex>
      </Box>
    </>
  );
};
