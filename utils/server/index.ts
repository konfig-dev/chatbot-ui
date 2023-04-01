import { Message } from '@/types/chat';
import { OpenAIModel } from '@/types/openai';
import { Openai } from 'openai-typescript-sdk';

export const OpenAIStream = async (
  model: OpenAIModel,
  systemPrompt: string,
  key: string,
  messages: Message[],
) => {
  const openai = new Openai({
    apiKey: key ? key : process.env.OPENAI_API_KEY,
  });

  const res = await openai.chat.createCompletionStream({
    model: model.id,
    max_tokens: 1000,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages,
    ],
    temperature: 1,
  });

  if (res.status !== 200) {
    const decoder = new TextDecoder();
    const statusText = res.statusText;
    const result = await res.data.getReader().read();
    throw new Error(
      `OpenAI API returned an error: ${
        decoder.decode(result?.value) || statusText
      }`,
    );
  }

  return res.data;
};
