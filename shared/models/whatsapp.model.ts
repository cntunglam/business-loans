import { z } from "zod";

export enum MessageType {
  TEXT = 1,
  IMAGE = 2,
  VIDEO = 3,
  AUDIO = 4,
  LOCATION = 5,
  DOCUMENT = 6,
  CONTACT = 7,
}

export const WhatsappMessageSchema = z
  .object({
    name: z.string(),
    type: z.nativeEnum(MessageType),
    "media-url": z.string(),
    "context-msg-id": z.coerce.number(),
    number: z.string(),
    //0 = incoming, 1 = outgoing
    direction: z.coerce.number().min(0).max(1),
    "unique-id": z.coerce.number(),
    "message-in": z.string(),
    "project-id": z.coerce.number(),
    "group-id": z.string(),
    application: z.coerce.number(),
    message_in_raw: z.string(),
  })
  .partial();

export interface WhatsappApiResponse {
  status: number;
  push_id: string;
  message: string;
  data: { msg_id: string; number: string; credit: string }[];
}

export type WhatsappMessage = z.infer<typeof WhatsappMessageSchema>;

export const WhatsappGroupSchema = z.object({
  status: z.coerce.number(),
  message: z.string(),
  group_id: z.string(),
  group_icon_link: z.string(),
  group_invite_link: z.string(),
  group_admins: z.array(z.object({ number: z.string(), created_time: z.string() })),
  group_members: z.array(z.object({ number: z.string(), created_time: z.string() })),
  group_created_date: z.string(),
});

export type WhatsappGroupApiResponse = z.infer<typeof WhatsappGroupSchema>;
