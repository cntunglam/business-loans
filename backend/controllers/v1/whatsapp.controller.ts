import { ERROR_KEYS, LoanRequestStatusEnum } from '@roshi/shared';
import { Request, Response } from 'express';
import { z } from 'zod';
import { prismaClient } from '../../clients/prismaClient';
import { whatsappClient } from '../../clients/whatsappClient';
import { generateReply } from '../../services/chatCompletion';
import { PICKY_APP_ID_TO_PHONE, ROSHI_PHONES } from '../../services/whatsapp.service';
import { errorResponse } from '../../utils/errorResponse';
import { successResponse } from '../../utils/successResponse';

export const getAllConversations = async (_: Request, res: Response) => {
  const users = await prismaClient.waUser.findMany({
    where: { phone: { notIn: Object.values(PICKY_APP_ID_TO_PHONE) } },
    include: {
      user: {
        include: {
          loanRequests: {
            where: { status: LoanRequestStatusEnum.ACTIVE },
            select: { privateNote: true, customerSupport: { select: { name: true, id: true } }, id: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      receivedMessages: { take: 1, orderBy: { createdAt: 'desc' } },
      sentMessages: { where: { targetGroupId: null }, take: 1, orderBy: { createdAt: 'desc' } },
    },
  });

  const groups = await prismaClient.waGroup.findMany({
    include: {
      members: { include: { user: true } },
      messages: { take: 1, orderBy: { createdAt: 'desc' } },
    },
  });

  const sorted = [...users, ...groups]
    .map((item) => {
      if ('phone' in item) {
        const sent = item.sentMessages.length > 0 ? item.sentMessages[0] : null;
        const received = item.receivedMessages.length > 0 ? item.receivedMessages[0] : null;
        const lastMessage = !sent ? received : !received ? sent : sent.createdAt > received.createdAt ? sent : received;
        const customerSupport = item.user?.loanRequests.find((req) => req.customerSupport)?.customerSupport;
        const note = item.user?.loanRequests.find((req) => req.privateNote)?.privateNote;
        const loanRequestId = item.user?.loanRequests.find((loanRequest) => loanRequest.id)?.id;

        return {
          ...item,
          targetId: item.phone,
          type: 'user',
          roshiPhone:
            lastMessage?.sourceWaPhone === item.phone ? lastMessage.targetWaPhone : lastMessage?.sourceWaPhone,
          name: item.waName || item.user?.name || item.phone,
          lastMessage: lastMessage,
          customerSupport,
          note,
          loanRequestId,
        };
      } else {
        return {
          ...item,
          type: 'group',
          name: item.name || item.members.map((user) => user.waName || user.user?.name || user.phone).join(', '),
          roshiPhone: item.members.find((user) => ROSHI_PHONES.includes(user.phone))?.phone,
          targetId: item.waId,
          lastMessage: item.messages.length > 0 ? item.messages[0] : null,
          customerSupport: undefined,
          note: undefined,
          loanRequestId: undefined,
        };
      }
    })
    .filter((item) => !!item.roshiPhone)
    .sort((a, b) => (b.lastMessage?.createdAt.getTime() || 0) - (a.lastMessage?.createdAt.getTime() || 0));
  return successResponse(res, sorted);
};

export const getWhatsappUser = async (req: Request, res: Response) => {
  const { roshiPhone } = req.query;
  if (!roshiPhone || typeof roshiPhone !== 'string') {
    return errorResponse(res, 400, ERROR_KEYS.VALIDATION_ERROR);
  }
  const user = await prismaClient.waUser.findUnique({
    where: { phone: req.params.phone },
    include: {
      sentMessages: {
        where: { OR: [{ sourceWaPhone: roshiPhone }, { targetWaPhone: roshiPhone }] },
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { name: true } } },
      },
      receivedMessages: {
        where: { OR: [{ sourceWaPhone: roshiPhone }, { targetWaPhone: roshiPhone }] },
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { name: true } } },
      },
    },
  });

  if (user) {
    await prismaClient.waMessage.updateMany({
      where: { isRead: false, OR: [{ sourceWaPhone: user.phone }, { targetWaPhone: user.phone }] },
      data: { isRead: true },
    });
  }

  return successResponse(res, user);
};

export const getWhatsappGroup = async (req: Request, res: Response) => {
  const group = await prismaClient.waGroup.findUnique({
    where: { waId: req.params.groupId },
    include: { messages: { orderBy: { createdAt: 'desc' }, include: { sourceWaUser: { include: { user: true } } } } },
  });

  if (group) {
    await prismaClient.waMessage.updateMany({
      where: { isRead: false, targetGroupId: group.waId },
      data: { isRead: true },
    });
  }

  const formatted = {
    ...group,
    messages:
      group?.messages.map((msg) => ({
        ...msg,
        sourceWaUser: null,
        userDisplayName: msg.sourceWaUser?.waName || msg.sourceWaUser?.user?.name || msg.sourceWaUser?.phone,
      })) || [],
  };

  return successResponse(res, formatted);
};

export const sendWhatsappMessageSchema = z.object({
  sourcePhone: z.string(),
  target: z.object({
    phone: z.string().optional(),
    groupId: z.string().optional(),
  }),
  text: z.string(),
});
export const sendWhatsappMessage = async (req: Request, res: Response) => {
  const { target, text, sourcePhone } = sendWhatsappMessageSchema.parse(req.body);
  const result = await whatsappClient.sendMessage(sourcePhone, target, text, req.user?.sub);
  return successResponse(res, result);
};

export const getGeneratedReplySchema = z.object({
  phone: z.string(),
  instruction: z.string().optional(),
});
export const getGeneratedReply = async (req: Request, res: Response) => {
  const { phone, instruction } = getGeneratedReplySchema.parse(req.body);
  const waUser = await prismaClient.waUser.findUniqueOrThrow({
    where: { phone },
    include: { receivedMessages: true, sentMessages: true },
  });
  const result = await generateReply(waUser, instruction);
  return successResponse(res, result);
};
