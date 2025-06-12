import TelegramBot from 'node-telegram-bot-api';
import { CONFIG } from '../config';

export const telegramClient = new TelegramBot(CONFIG.TELEGRAM_BOT_TOKEN, { polling: false });
