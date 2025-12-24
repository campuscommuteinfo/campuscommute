
'use server';
/**
 * @fileOverview Predicts crowd levels on buses using an AI model.
 * 
 * Research Paper Alignment:
 * - LSTM-based demand prediction → Gemini AI with temporal context
 * - XAI (Explainable AI) → Detailed explanations with confidence
 * - Academic calendar awareness → Event-based predictions
 * 
 * - predictBusCrowdLevels - A function that predicts the crowd level of a bus.
 * - PredictBusCrowdLevelsInput - The input type for the predictBusCrowdLevels function.
 * - PredictBusCrowdLevelsOutput - The return type for the predictBusCrowdLevels function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PredictBusCrowdLevelsInputSchema = z.object({
  routeId: z.string().describe('The ID of the bus route.'),
  time: z.string().describe('The time of day to predict crowd levels for (e.g., 8:00 AM).'),
  dayOfWeek: z.string().describe('The day of the week (e.g., Monday).'),
  academicCalendarEvents: z.string().optional().describe('Any relevant events from the academic calendar, such as exams, holidays, or special events.'),
  currentCrowdReports: z.string().optional().describe('Recent crowd reports from other users in the last 30 minutes.'),
});
export type PredictBusCrowdLevelsInput = z.infer<typeof PredictBusCrowdLevelsInputSchema>;

const PredictBusCrowdLevelsOutputSchema = z.object({
  crowdLevel: z.enum(['Green', 'Yellow', 'Red']).describe('The predicted crowd level (Green, Yellow, or Red).'),
  confidence: z.number().min(0).max(100).describe('Confidence score (0-100%) for this prediction.'),
  estimatedWaitTime: z.number().describe('Estimated wait time in minutes.'),
  explanation: z.string().describe('Clear explanation for the predicted crowd level.'),
  factors: z.array(z.string()).describe('Key factors that influenced this prediction.'),
  recommendation: z.string().describe('Actionable recommendation for the commuter.'),
});
export type PredictBusCrowdLevelsOutput = z.infer<typeof PredictBusCrowdLevelsOutputSchema>;

export async function predictBusCrowdLevels(input: PredictBusCrowdLevelsInput): Promise<PredictBusCrowdLevelsOutput> {
  return predictBusCrowdLevelsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictBusCrowdLevelsPrompt',
  input: { schema: PredictBusCrowdLevelsInputSchema },
  output: { schema: PredictBusCrowdLevelsOutputSchema },
  prompt: `You are an AI assistant designed to predict crowd levels on campus buses in Knowledge Park, Greater Noida.

Your predictions should be EXPLAINABLE (XAI) - users should understand WHY you made this prediction.

## Crowd Level Definitions:
- **Green**: Mostly empty (0-40% capacity) - Easy to find a seat
- **Yellow**: Moderate (40-75% capacity) - May need to stand briefly  
- **Red**: Crowded (75-100% capacity) - Standing room only

## Knowledge Park Context:
- **Morning Peak**: 8:00-10:00 AM (classes start at 9:00 AM)
- **Evening Peak**: 4:00-6:00 PM (classes end at 5:00 PM)
- **Lunch Rush**: 12:00-1:30 PM (moderate)
- **Routes**: Connect Knowledge Park to Pari Chowk, Alpha, Noida Sector 62
- **Special Events**: Exams, placements, fests cause 30-50% more traffic

## Input Data:
- Route ID: {{{routeId}}}
- Time: {{{time}}}
- Day of Week: {{{dayOfWeek}}}
{{#if academicCalendarEvents}}
- Academic Events: {{{academicCalendarEvents}}}
{{/if}}
{{#if currentCrowdReports}}
- Recent Crowd Reports: {{{currentCrowdReports}}}
{{/if}}

## Output Requirements:
1. **crowdLevel**: Green, Yellow, or Red
2. **confidence**: 0-100 (higher if you have more data points)
3. **estimatedWaitTime**: Minutes until the bus arrives (typical: 5-15 mins)
4. **explanation**: 1-2 sentences explaining your prediction
5. **factors**: List 2-4 key factors (e.g., "Morning peak hour", "Exam week")
6. **recommendation**: What should the commuter do? (e.g., "Leave 10 minutes early")

Be realistic and helpful. Students rely on accurate predictions.`,
});

const predictBusCrowdLevelsFlow = ai.defineFlow(
  {
    name: 'predictBusCrowdLevelsFlow',
    inputSchema: PredictBusCrowdLevelsInputSchema,
    outputSchema: PredictBusCrowdLevelsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
