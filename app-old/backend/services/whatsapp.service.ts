import { ERROR_KEYS, WaMessageDeliveryStatusEnum, WhatsappApiResponse, WhatsappMessage } from '@roshi/shared';
import { prismaClient } from '../clients/prismaClient';
import { whatsappClient } from '../clients/whatsappClient';
import { CONFIG } from '../config';
import { RoshiError } from '../utils/roshiError';

export const PICKY_APP_ID_TO_PHONE = {
  '10': CONFIG.WA_PHONE_NUMBER,
  '51': '6589509286',
};

export const PHONE_TO_PICKY_APP_ID = Object.keys(PICKY_APP_ID_TO_PHONE).reduce(
  (acc, key) => ({ [PICKY_APP_ID_TO_PHONE[key as keyof typeof PICKY_APP_ID_TO_PHONE]]: key, ...acc }),
  {} as Record<string, string>,
);

export const ROSHI_PHONES = Object.values(PICKY_APP_ID_TO_PHONE);

(async () => {
  //make sure roshi phone numbers are created as waUser
  await prismaClient.waUser.upsert({
    where: { phone: CONFIG.WA_PHONE_NUMBER },
    update: {},
    create: { phone: CONFIG.WA_PHONE_NUMBER, waName: 'ROSHI' },
  });
  await prismaClient.waUser.upsert({
    where: { phone: PICKY_APP_ID_TO_PHONE['51'] },
    update: {},
    create: { phone: PICKY_APP_ID_TO_PHONE['51'], waName: 'ROSHI Main' },
  });
})();

const processWaUser = async (phoneNumber: string, waName?: string) => {
  let waUser = await prismaClient.waUser.findUnique({ where: { phone: phoneNumber } });
  if (!waUser || !waUser.userId) {
    const user = await prismaClient.user.findUnique({ where: { phone: phoneNumber } });
    waUser = await prismaClient.waUser.upsert({
      where: { phone: phoneNumber },
      update: { userId: user?.id },
      create: { phone: phoneNumber, waName, userId: user?.id },
    });
  } else if (!waUser.waName && waName) {
    await prismaClient.waUser.update({ where: { phone: phoneNumber }, data: { waName } });
  }
  return waUser;
};

const processWaGroup = async (groupId: string, appId: number) => {
  let group = await prismaClient.waGroup.findUnique({ where: { waId: groupId } });
  if (!group) {
    const groupInfo = await whatsappClient.getGroupInfo(groupId, appId);
    //Make sure users exist as waUser
    await Promise.allSettled(groupInfo.group_members.map((member) => processWaUser(member.number)));

    await prismaClient.waGroup.create({
      data: {
        waId: groupId,
        members: { connect: groupInfo.group_members.map((member) => ({ phone: member.number })) },
      },
    });
  }
};

export const processWaMessageFromPicky = async (message: WhatsappMessage) => {
  if (!message.application || !message['unique-id'] || !message.number)
    throw new RoshiError(ERROR_KEYS.WHATSAPP_INCOMPLETE_PAYLOAD);
  if (!(message.application in PICKY_APP_ID_TO_PHONE)) throw new RoshiError(ERROR_KEYS.WHATSAPP_UNKNOWN_APPLICATION_ID);
  //If group ID, create group
  if (message['group-id']) {
    await processWaGroup(message['group-id'], message.application);
  } else {
    await processWaUser(message.number, message.name);
  }

  await prismaClient.waMessage.create({
    data: {
      waId: message['unique-id'].toString(),
      text: message['message_in_raw'] || '',
      imageUrl: message['media-url'],
      sourceWaPhone: message['group-id'] ? message.number.split('@')[0] : message.number,
      targetGroupId: message['group-id'],
      //Ignore targetWaPhone when groupId is present
      targetWaPhone: message['group-id']
        ? undefined
        : PICKY_APP_ID_TO_PHONE[message.application.toString() as keyof typeof PICKY_APP_ID_TO_PHONE],
      isAuto: false,
      repliedId: message['context-msg-id']?.toString(),
      //when coming from picky, it means always delivered (received)
      deliveryStatus: WaMessageDeliveryStatusEnum.SUCCESS,
    },
  });
};

export const processSentWaMessage = async (
  message: WhatsappApiResponse & {
    sourcePhone: string;
    targetPhone?: string;
    targetGroupId?: string;
    text: string;
    userId?: string;
  },
) => {
  if (!(message.sourcePhone in PHONE_TO_PICKY_APP_ID)) throw new RoshiError(ERROR_KEYS.WHATSAPP_UNKNOWN_APPLICATION_ID);
  const appId = PHONE_TO_PICKY_APP_ID[message.sourcePhone];

  if (!message.targetPhone && !message.targetGroupId) throw new RoshiError(ERROR_KEYS.WHATSAPP_MISSING_TARGET);

  if (message.targetGroupId) {
    await processWaGroup(message.targetGroupId, Number(appId));
  } else {
    await processWaUser(message.targetPhone!);
  }

  return prismaClient.waMessage.create({
    data: {
      waId: message.data[0].msg_id,
      text: message.text,
      sourceWaPhone: message.sourcePhone,
      targetGroupId: message.targetGroupId,
      targetWaPhone: message.targetGroupId ? undefined : message.targetPhone,
      isAuto: !message.userId,
      createdById: message.userId,
      isRead: true,
      //Sent doesn't mean it's delivered. We have to later check and update the deliveryStatus
      deliveryStatus: WaMessageDeliveryStatusEnum.PENDING,
    },
  });
};
