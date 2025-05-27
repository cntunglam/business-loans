import { AttachFile, Menu, Send } from "@mui/icons-material";
import { Box, Button, CircularProgress, Divider, Textarea, Typography } from "@mui/joy";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useGetWhatsappGroup, useSendWhatsappMessage } from "../../api/useWhatsappApi";
import { useKeypress } from "../../hooks/useKeypress";
import { getDifference, isImageUrl } from "../../utils/utils";
import { Flex } from "../shared/flex";

interface Props {
  group: { name: string; targetId: string; roshiPhone?: string | null; type: string };
  refetchAll: () => void;
  openDrawer: () => void;
}

export const GroupConversation: FC<Props> = ({ group, refetchAll, openDrawer }) => {
  const textAreadRef = useRef<HTMLTextAreaElement>(null);
  const { data: groupData, refetch } = useGetWhatsappGroup(group.targetId);
  const [newMessage, setNewMessage] = useState("");
  const sendWhatsappMessage = useSendWhatsappMessage();
  useKeypress(["Enter"], () => sendMessage());
  useKeypress(["Alt", "Enter"], () => setNewMessage((newMsg) => newMsg + "\n"));

  const sendMessage = useCallback(async () => {
    if (sendWhatsappMessage.isPending) return;
    if (!newMessage) return;
    await sendWhatsappMessage
      .mutateAsync({ sourcePhone: group.roshiPhone!, target: { groupId: group.targetId }, text: newMessage })
      .then(() => {
        setNewMessage("");
        refetch();
        refetchAll();
      })
      .catch(() => {});
    setTimeout(() => textAreadRef?.current?.focus(), 200);
  }, [newMessage, refetch, refetchAll, sendWhatsappMessage, group]);

  useEffect(() => {
    const intervalId = setInterval(() => refetch(), 10000);
    return () => clearInterval(intervalId);
  }, [refetch]);

  return (
    <Flex y fullwidth grow sx={{ backgroundColor: "background.body" }}>
      <Flex x yc px={1} gap3 sx={{ height: "40px" }}>
        <Button
          variant="outlined"
          color="neutral"
          sx={{ display: { xs: "block", md: "none" } }}
          onClick={() => openDrawer()}
        >
          <Menu />
        </Button>
        <Typography level="title-md">{group.name}</Typography>
      </Flex>
      <Divider />
      <Flex
        y
        fullwidth
        p={1}
        pb={1}
        sx={{
          flexDirection: "column-reverse",
          overflowY: "auto",
          height: `calc(100vh - 170px)`,
        }}
        gap2
      >
        {groupData?.messages?.map((message) => {
          const isReceived = message.sourceWaPhone !== group.roshiPhone;
          return (
            <Flex y key={message.id}>
              {message.sourceWaPhone !== group.roshiPhone && (
                <Typography textColor="primary.400" level="title-sm">
                  {message.userDisplayName}
                </Typography>
              )}
              <Flex x ye sx={{ flexDirection: isReceived ? "row" : "row-reverse" }} gap1>
                <Typography
                  component={message.imageUrl ? "a" : "p"}
                  href={message.imageUrl ? message.imageUrl : undefined}
                  target="_blank"
                  startDecorator={
                    message.imageUrl && !isImageUrl(message.imageUrl) ? <AttachFile color="primary" /> : undefined
                  }
                  key={message.id}
                  level="body-sm"
                  whiteSpace={"pre-wrap"}
                  fontWeight={600}
                  p={1}
                  borderRadius={8}
                  sx={{
                    maxWidth: "85%",
                    alignSelf: isReceived ? "flex-start" : "flex-end",
                    backgroundColor: isReceived ? "#f5f8fe" : "primary.50",
                    border: "1px solid",
                    borderColor: isReceived ? "divider" : "primary.500",
                  }}
                >
                  <Flex y>
                    {message.imageUrl && isImageUrl(message.imageUrl) && (
                      <Box sx={{ maxWidth: "min(100vw, 500px)", overflow: "hidden" }}>
                        <img src={message.imageUrl} width={"100%"} height={"100%"} />
                      </Box>
                    )}
                    {message.text || message.imageUrl?.replace("https://cdn.pickyassist.com/uploads/images/", "")}
                  </Flex>
                </Typography>
                <Typography level="body-sm">{getDifference(message.createdAt)}</Typography>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
      <Flex x fullwidth gap1 yc px={1}>
        <Textarea
          slotProps={{ textarea: { ref: textAreadRef } }}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          minRows={2}
          maxRows={5}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          disabled={sendWhatsappMessage.isPending}
          sx={{ flexGrow: 1 }}
        />
        <Flex y gap1>
          <Button
            size="sm"
            variant="solid"
            color={!newMessage ? "neutral" : "secondary"}
            loading={sendWhatsappMessage.isPending}
            onClick={() => sendMessage()}
          >
            {sendWhatsappMessage.isPending ? <CircularProgress /> : <Send htmlColor="white" />}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};
