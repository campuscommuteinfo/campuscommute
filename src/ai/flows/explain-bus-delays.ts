'use server';
/**
 * @fileOverview This file defines a Genkit flow to explain bus delays to students.
 *
 * - explainBusDelay - A function that takes bus route and stop information, and returns an explanation for potential delays.
 * - ExplainBusDelayInput - The input type for the explainBusDelay function.
 * - ExplainBusDelayOutput - The return type for the explainBusDelay function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainBusDelayInputSchema = z.object({
  route: z.string().describe('The bus route number or identifier.'),
  stop: z.string().describe('The specific bus stop where the delay is experienced.'),
});
export type ExplainBusDelayInput = z.infer<typeof ExplainBusDelayInputSchema>;

const ExplainBusDelayOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the potential reasons for the bus delay.'),
});
export type ExplainBusDelayOutput = z.infer<typeof ExplainBusDelayOutputSchema>;

export async function explainBusDelay(input: ExplainBusDelayInput): Promise<ExplainBusDelayOutput> {
  return explainBusDelayFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainBusDelayPrompt',
  input: {schema: ExplainBusDelayInputSchema},
  output: {schema: ExplainBusDelayOutputSchema},
  prompt: `You are a helpful AI assistant providing explanations for bus delays to students.

  Given the bus route and stop, explain the possible reasons for the delay. Consider factors like traffic, time of day, weather, and special events like exams or holidays.

  Route: {{{route}}}
  Stop: {{{stop}}}
  \n  Provide a concise and informative explanation:
  `,
});

const explainBusDelayFlow = ai.defineFlow(
  {
    name: 'explainBusDelayFlow',
    inputSchema: ExplainBusDelayInputSchema,
    outputSchema: ExplainBusDelayOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
