/**
 * @file OpenAI.Service.ts
 * @description OpenAI service for interacting with the OpenAI API
 */

import { Request, Response } from "express";
import {
  ChatCompletionRequestMessage,
  ChatCompletionResponseMessage,
  Configuration,
  OpenAIApi
} from "openai";
import { OPENAI_KEY } from "../constants";

const openaiConfig = new Configuration({ apiKey: OPENAI_KEY });
const openAiApi = new OpenAIApi(openaiConfig);
const COMPLETIONS_MODEL = "text-davinci-003";
const CHAT_MODEL = "gpt-3.5-turbo";
const DEFAULT_PROMPT = "Generate a short writing prompt";
const prompt_history: (
  | ChatCompletionRequestMessage
  | ChatCompletionResponseMessage
)[] = [
  { role: "system", content: "You are a helpful writing-prompt generator." },
  {
    role: "user",
    content: `Roleplay a prompt-generator that prefers short responses. 
  If an input is prefaced with [ CONTEXT TYPE ], provide a short response using [ CONTEXT TYPE ] to instruct
  your response, and exclude both it and your context from your response. If asked for writing prompts, please 
  respond with just a short writing prompt. When an input cannot be accurately translated into a prompt, preface your 
  response with "[ ERROR ] " and briefly explain why the input was invalid. Good luck! Everyone will love you.
  If you understand, please respond with "OK".`
  },
  { role: "system", content: "OK" }
];

/**
 * Generate a `completion` (OpenAI API's term for the result of calling the API on a prompt).
 * See https://platform.openai.com/docs/api-reference/completions/create
 * @deprecated Use `generateChatCompletion` instead, since it is "cheaper"
 */
export async function generateCompletion(prompt = DEFAULT_PROMPT) {
  try {
    const completion = await openAiApi.createCompletion({
      prompt,
      model: COMPLETIONS_MODEL,
      max_tokens: 150,
      temperature: 0,
      presence_penalty: 1.2,
      frequency_penalty: 0.1,
      echo: false
      //   stop: ["\n", " Human:", " AI:"],
      //   ADDITIONAL PARAMETERS
      //   top_p: 1,
      //   best_of: 1,
      //   n: 1,
      //   stream: false,
      //   logprobs: null,
    });

    const [{ text = "" }] = completion.data.choices;
    return text;
  } catch (error: any) {
    console.error(error.message || error);
    return "Error generating prompt";
  }
}

/**
 * Generate a `chat completion` (a prompt with retained context).
 * See https://platform.openai.com/docs/api-reference/chat/create
 * @param prompt The prompt to generate a chat completion for
 * @param chatLog The chat log to retain context from
 * @returns The chat completion
 */
export async function generateChatCompletion(prompt = DEFAULT_PROMPT) {
  prompt_history.push(createChatCompletionMsg(prompt));
  try {
    const completion = await openAiApi.createChatCompletion({
      messages: [...prompt_history],
      max_tokens: 150,
      temperature: 0,
      presence_penalty: 1.2,
      frequency_penalty: 0.1,
      stop: ["\n", " Human:", " AI:"],
      model: CHAT_MODEL
      //   ADDITIONAL PARAMETERS
      //   top_p: 1,
      //   best_of: 1,
      //   n: 1,
      //   stream: false,
    });

    const [{ message = "" }] = completion.data.choices;
    return message;
  } catch (error: any) {
    console.error(error.message || error);
    return "Error generating prompt";
  }
}

/** Express route handler for generating a generic writing prompt */
export async function generateWritingPromptHandler(
  req: Request,
  res: Response
) {
  const prompt = req.body.prompt || DEFAULT_PROMPT;
  const text = await generateChatCompletion(prompt);
  if (!text || text === "Error generating prompt")
    res.status(200).json({ prompt: "(Prompt was not generated)" });
  else {
    prompt_history.push(text);
    res.status(200).json({ prompt: text.content });
  }
}

// HELPER FUNCTIONS

// Create a message for the chat completion API call
function createChatCompletionMsg(content: string) {
  return { role: "user", content } as ChatCompletionRequestMessage;
}
