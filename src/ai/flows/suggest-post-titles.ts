'use server';

/**
 * @fileOverview A flow for suggesting post titles based on the post content.
 *
 * - suggestPostTitles - A function that suggests post titles.
 * - SuggestPostTitlesInput - The input type for the suggestPostTitles function.
 * - SuggestPostTitlesOutput - The output type for the suggestPostTitles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPostTitlesInputSchema = z.object({
  postContent: z
    .string()
    .describe('The content of the post for which to generate titles.'),
});
export type SuggestPostTitlesInput = z.infer<typeof SuggestPostTitlesInputSchema>;

const SuggestPostTitlesOutputSchema = z.object({
  titles: z
    .array(z.string())
    .describe('An array of suggested titles for the post.'),
});
export type SuggestPostTitlesOutput = z.infer<typeof SuggestPostTitlesOutputSchema>;

export async function suggestPostTitles(input: SuggestPostTitlesInput): Promise<SuggestPostTitlesOutput> {
  return suggestPostTitlesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPostTitlesPrompt',
  input: {schema: SuggestPostTitlesInputSchema},
  output: {schema: SuggestPostTitlesOutputSchema},
  prompt: `You are an expert at creating engaging titles for online posts.

  Based on the content of the post below, suggest 5 different titles that would be appealing to readers.

  Post Content:
  {{postContent}}
  `,
});

const suggestPostTitlesFlow = ai.defineFlow(
  {
    name: 'suggestPostTitlesFlow',
    inputSchema: SuggestPostTitlesInputSchema,
    outputSchema: SuggestPostTitlesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
