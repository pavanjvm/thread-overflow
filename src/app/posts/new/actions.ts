'use server';

import {
  suggestPostTitles,
  type SuggestPostTitlesInput,
  type SuggestPostTitlesOutput,
} from '@/ai/flows/suggest-post-titles';
import { z } from 'zod';

const inputSchema = z.object({
  postContent: z.string(),
});

export async function suggestPostTitlesAction(
  input: SuggestPostTitlesInput
): Promise<SuggestPostTitlesOutput> {
  const validatedInput = inputSchema.parse(input);
  try {
    const output = await suggestPostTitles(validatedInput);
    return output;
  } catch (error) {
    console.error('Error in suggestPostTitlesAction:', error);
    // Depending on your error handling strategy, you might want to throw
    // the error or return a specific error structure.
    return { titles: [] };
  }
}
