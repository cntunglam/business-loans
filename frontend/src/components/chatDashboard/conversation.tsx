import { AttachFile, Menu, RotateLeftOutlined, Send } from "@mui/icons-material";
import { Box, Button, CircularProgress, Divider, Textarea, Typography } from "@mui/joy";
import { format } from "date-fns";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetLeadById, useGetUserByPhone } from "../../api/useAdminApi";
import { useGetGeneratedReply, useGetWhatsappUser, useSendWhatsappMessage } from "../../api/useWhatsappApi";
import { useKeypress } from "../../hooks/useKeypress";
import { isImageUrl } from "../../utils/utils";
import { Flex } from "../shared/flex";
import { ChatLeadData } from "./chatLeadData";
import { TemplateSelector } from "./templateSelector";

interface Props {
  user: { targetId: string; roshiPhone?: string | null; type: string };
  refetchAll: () => void;
  openDrawer: () => void;
}

export const Conversation: FC<Props> = ({ user, refetchAll, openDrawer }) => {
  const textAreadRef = useRef<HTMLTextAreaElement>(null);
  const { data: userData, refetch } = useGetWhatsappUser(user.targetId, user.roshiPhone!);
  const { data: roshiUser } = useGetUserByPhone(user.targetId);
  const [newMessage, setNewMessage] = useState("");
  const sendWhatsappMessage = useSendWhatsappMessage();
  const { data: loanRequest, refetch: refetchLead } = useGetLeadById(roshiUser?.loanRequests[0]?.id);
  const generateReply = useGetGeneratedReply();
  useKeypress(["Enter"], () => sendMessage());
  useKeypress(["Alt", "Enter"], () => setNewMessage((newMsg) => newMsg + "\n"));

  const sendMessage = useCallback(async () => {
    if (sendWhatsappMessage.isPending) return;
    if (!newMessage) return;
    await sendWhatsappMessage
      .mutateAsync({ sourcePhone: user.roshiPhone!, target: { phone: user.targetId }, text: newMessage })
      .then(() => {
        setNewMessage("");
        refetch();
        refetchAll();
      })
      .catch(() => {});
    setTimeout(() => textAreadRef?.current?.focus(), 200);
  }, [newMessage, refetch, refetchAll, sendWhatsappMessage, user]);

  const messages = useMemo(() => {
    if (!userData) return [];
    return userData.sentMessages
      .concat(userData.receivedMessages)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [userData]);

  useEffect(() => {
    const intervalId = setInterval(() => refetch(), 10000);
    return () => clearInterval(intervalId);
  }, [refetch]);

  return (
    <Flex y fullwidth grow sx={{ backgroundColor: "background.body" }}>
      <Flex x yc px={1} gap3 sx={{ height: "130px" }}>
        <Button
          variant="outlined"
          color="neutral"
          sx={{ display: { xs: "block", md: "none" } }}
          onClick={() => openDrawer()}
        >
          <Menu />
        </Button>
        {loanRequest ? (
          <Box sx={{ maxWidth: { xs: "calc(100vw - 50px)", maxHeight: "100%", md: "auto", overflow: "auto" } }}>
            <ChatLeadData loanRequest={loanRequest} refetch={refetchLead} />
          </Box>
        ) : (
          <Flex y>
            <Typography level="title-md">{userData?.phone}</Typography>
            <Typography level="body-sm">{userData?.waName || roshiUser?.name}</Typography>
            {userData && <Typography level="body-sm">(Not on ROSHI)</Typography>}
          </Flex>
        )}
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
          height: `calc(100vh - 280px)`,
        }}
        gap2
      >
        {messages?.map((message) => {
          const isReceived = message.sourceWaPhone === user.targetId;
          return (
            <Flex y key={message.id}>
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
                <Flex y>
                  <Typography level="body-xs">{format(message.createdAt, "dd/MM HH:mm")}</Typography>
                  <Typography textColor={"secondary.400"} level="body-xs">
                    {(!isReceived && message?.createdBy?.name) || "System"}
                  </Typography>
                </Flex>
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
          disabled={sendWhatsappMessage.isPending || generateReply.isPending}
          sx={{ flexGrow: 1 }}
        />
        <Flex y gap1>
          <Flex x gap1>
            <Button
              size="sm"
              loading={generateReply.isPending}
              onClick={() =>
                generateReply
                  .mutateAsync({ phone: user.targetId, instruction: newMessage })
                  .then((res) => setNewMessage(res.data || ""))
              }
            >
              <RotateLeftOutlined />
            </Button>
            {loanRequest && (
              <TemplateSelector
                loanRequestId={loanRequest?.id}
                setContent={setNewMessage}
                isLoading={generateReply.isPending || sendWhatsappMessage.isPending}
              />
            )}
          </Flex>
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
