import { telegramClient } from '../clients/telegramClient';

export interface TelegramButton {
  text: string;
  url: string;
}

export const sendMessage = async (chatId: string, text: string, buttons?: TelegramButton[]) => {
  try {
    const options = buttons?.length
      ? {
          reply_markup: {
            inline_keyboard: [buttons.map((button) => ({ text: button.text, url: button.url }))],
          },
        }
      : undefined;

    await telegramClient.sendMessage(chatId, text, options);
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
};
