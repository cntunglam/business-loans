import { openaiClient } from '../clients/openaiClient';

export async function runPromptImage(image_base64: string, prompt: any) {
  const gptResponse = await openaiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: [
          ...prompt,
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${image_base64}`,
            },
          },
        ],
      },
    ],
  });
  const result = gptResponse.choices[0].message.content;
  return JSON.parse(result || '');
}

export type ChatGptConversation = { role: 'user' | 'assistant'; content: string };
export async function runPrompt(
  systemPrompt: string,
  commonQnA: string[],
  pastConversations: ChatGptConversation[],
  prompt?: string,
) {
  const messages: { role: 'user' | 'system' | 'assistant'; content: string }[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...commonQnA.map((qna): { role: 'assistant'; content: string } => ({
      role: 'assistant',
      content: qna,
    })),
    ...pastConversations,
  ];
  if (prompt) {
    messages.push({
      role: 'system',
      content: prompt,
    });
  }

  const gptResponse = await openaiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
  });

  const result = gptResponse.choices[0].message.content;
  return result;
}
