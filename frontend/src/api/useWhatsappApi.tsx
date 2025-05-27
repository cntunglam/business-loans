import type {
  getAllConversations,
  getGeneratedReply,
  getGeneratedReplySchema,
  getWhatsappGroup,
  getWhatsappUser,
  sendWhatsappMessage,
  sendWhatsappMessageSchema,
} from "@roshi/backend";
import { AwaitedRT } from "@roshi/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useAxios } from "./useAxios";

export const useGetWhatsappUser = (phone?: string, roshiPhone?: string) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["useGetWhatsappUser", phone],
    queryFn: () =>
      axios
        .get<AwaitedRT<typeof getWhatsappUser>>("/whatsapp/user/" + phone, { params: { roshiPhone: roshiPhone } })
        .then((res) => res.data.data),
    enabled: !!phone,
  });
};

export const useGetWhatsappGroup = (groupId?: string, enabled?: boolean) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["useGetWhatsappGroup", groupId],
    queryFn: () =>
      axios.get<AwaitedRT<typeof getWhatsappGroup>>("/whatsapp/group/" + groupId).then((res) => res.data.data),
    enabled: !!groupId && enabled,
  });
};

export const useSendWhatsappMessage = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (args: z.infer<typeof sendWhatsappMessageSchema>) =>
      axios.post<AwaitedRT<typeof sendWhatsappMessage>>("/whatsapp/message", args).then((res) => res.data),
  });
};

export const useGetGeneratedReply = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (args: z.infer<typeof getGeneratedReplySchema>) =>
      axios.post<AwaitedRT<typeof getGeneratedReply>>("/whatsapp/generate-reply", args).then((res) => res.data),
  });
};

export const useGetAllConversations = () => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["useGetAllConversations"],
    queryFn: () =>
      axios.get<AwaitedRT<typeof getAllConversations>>("/whatsapp/conversations").then((res) => res.data.data),
  });
};
