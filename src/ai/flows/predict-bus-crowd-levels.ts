
'use server';
/**
 * @fileOverview Predicts crowd levels on buses using an AI model.
 *
 * - predictBusCrowdLevels - A function that predicts the crowd level of a bus.
 * - PredictBusCrowdLevelsInput - The input type for the predictBusCrowdLevels function.
 * - PredictBusCrowdLevelsOutput - The return type for the predictBusCrowdLevels function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictBusCrowdLevelsInputSchema = z.object({
  routeId: z.string().describe('The ID of the bus route.'),
  time: z.string().describe('The time of day to predict crowd levels for (e.g., 8:00 AM).'),
  dayOfWeek: z.string().describe('The day of the week (e.g., Monday).'),
  academicCalendarEvents: z.string().optional().describe('Any relevant events from the academic calendar, such as exams.'),
});
export type PredictBusCrowdLevelsInput = z.infer<typeof PredictBusCrowdLevelsInputSchema>;

const PredictBusCrowdLevelsOutputSchema = z.object({
  crowdLevel: z.enum(['Green', 'Yellow', 'Red']).describe('The predicted crowd level (Green, Yellow, or Red).'),
  explanation: z.string().describe('Explanation for the predicted crowd level.'),
});
export type PredictBusCrowdLevelsOutput = z.infer<typeof PredictBusCrowdLevelsOutputSchema>;

export async function predictBusCrowdLevels(input: PredictBusCrowdLevelsInput): Promise<PredictBusCrowdLevelsOutput> {
  return predictBusCrowdLevelsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictBusCrowdLevelsPrompt',
  input: {schema: PredictBusCrowdLevelsInputSchema},
  output: {schema: PredictBusCrowdLevelsOutputSchema},
  prompt: `You are an AI assistant designed to predict the crowd levels of buses for students in Knowledge Park, Greater Noida.

  Given the route ID, time, day of week, and any academic calendar events, predict the crowd level of the bus.
  - Green means the bus is mostly empty and you'll easily find a seat.
  - Yellow means the bus is about half full, with most seats taken.
  - Red means the bus is crowded, and it's standing room only.

  Consider common student schedules: classes usually run from 9 AM to 5 PM. Peak hours are likely 8-10 AM and 4-6 PM on weekdays. Weekends are generally less crowded unless there's a special event.

  Route ID: {{{routeId}}}
  Time: {{{time}}}
  Day of Week: {{{dayOfWeek}}}
  {{#if academicCalendarEvents}}
  Academic Calendar Events: {{{academicCalendarEvents}}}
  {{/if}}
  
  Generate a crowd level prediction and a concise explanation based on these factors.`,
});

const predictBusCrowdLevelsFlow = ai.defineFlow(
  {
    name: 'predictBusCrowdLevelsFlow',
    inputSchema: PredictBusCrowdLevelsInputSchema,
    outputSchema: PredictBusCrowdLevelsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
