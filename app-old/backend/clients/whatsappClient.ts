import { ERROR_KEYS, WhatsappApiResponse, WhatsappGroupApiResponse } from '@roshi/shared';
import { CONFIG } from '../config';
import { PHONE_TO_PICKY_APP_ID, processSentWaMessage } from '../services/whatsapp.service';
import { RoshiError } from '../utils/roshiError';

const WHATSAPP_API_URL =
  CONFIG.NODE_ENV === 'production' ? `${CONFIG.WA_API_BASE_URL}/push` : `http://localhost:${CONFIG.PORT}/whatsapp-test`;

export const whatsappClient = {
  getGroupInfo: async (groupId: string, appId: number) => {
    const result = (await fetch(`${CONFIG.WA_API_BASE_URL}/group-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: CONFIG.WA_PICKY_TOKEN,
        application: appId,
        group_id: groupId,
      }),
    }).then((res) => (res.ok ? res.json() : Promise.reject(res.json())))) as WhatsappGroupApiResponse;
    return result;
  },
  sendMessage: async (
    sourcePhoneNumber: string,
    target: { groupId?: string; phone?: string },
    text: string,
    userId?: string,
    shouldStoreMessage = true,
  ) => {
    if (!target.phone && !target.groupId) throw new RoshiError(ERROR_KEYS.WHATSAPP_MISSING_TARGET);
    if (!(sourcePhoneNumber in PHONE_TO_PICKY_APP_ID)) throw new RoshiError(ERROR_KEYS.WHATSAPP_UNKNOWN_APPLICATION_ID);
    const appId = PHONE_TO_PICKY_APP_ID[sourcePhoneNumber];
    const result = (await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        target.groupId
          ? {
              token: CONFIG.WA_PICKY_TOKEN,
              application: appId,
              group_id: target.groupId,
              globalmessage: text,
            }
          : {
              token: CONFIG.WA_PICKY_TOKEN,
              application: appId,
              createcontact: '0',
              data: [{ number: target.phone, message: text }],
            },
      ),
    }).then((res) => (res.ok ? res.json() : Promise.reject(res.json())))) as WhatsappApiResponse;
    if (result.status !== 100) {
      console.error(result);
      throw new RoshiError(ERROR_KEYS.ERROR_SENDING_WA_MESSAGE);
    }

    if (!shouldStoreMessage) return;

    const processed = await processSentWaMessage({
      ...result,
      sourcePhone: sourcePhoneNumber,
      targetGroupId: target.groupId,
      targetPhone: target.phone,
      text,
      userId: userId,
    });

    return processed;
  },
};
