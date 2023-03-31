import { OpenAIModel, OpenAIModelID, OpenAIModels } from '@/types/openai';
import { OPENAI_API_HOST } from '@/utils/app/const';
import { Openai } from 'openai-typescript-sdk';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { key } = (await req.json()) as {
      key: string;
    };

    const openai = new Openai({
      apiKey: key ? key : process.env.OPENAI_API_KEY,
      useFetch: true,
    });

    const response = await openai.models.list();

    if (response.status === 401) {
      return new Response(response.statusText, {
        status: 500,
        headers: response.headers,
      });
    } else if (response.status !== 200) {
      console.error(
        `OpenAI API returned an error ${response.status}: ${response.statusText}`,
      );
      throw new Error('OpenAI API returned an error');
    }

    const models: Partial<OpenAIModel>[] = response.data.data
      .filter((model) => {
        for (const [key, value] of Object.entries(OpenAIModelID)) {
          if (value === model.id) {
            return true;
          }
        }
        return false;
      })
      .map((model) => {
        for (const [key, value] of Object.entries(OpenAIModelID)) {
          if (value === model.id) {
            return {
              id: model.id,
              name: OpenAIModels[value].name,
            };
          }
        }
        throw Error('Should not have got here');
      });

    return new Response(JSON.stringify(models), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
};

export default handler;
