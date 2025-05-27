import OpenAI from 'openai';
import { CONFIG } from '../config';

export const openaiClient = new OpenAI({
  apiKey: CONFIG.OPENAI_API_KEY,
});
