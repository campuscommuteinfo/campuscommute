'use server';
/**
 * @fileOverview AI-powered fare suggestion for ride sharing.
 * 
 * Research Paper Alignment:
 * - Dynamic fare matrix with academic calendar data (PCT Filing)
 * - 94% fare prediction accuracy target
 * - Transparent pricing for student commutes
 * 
 * - suggestRideFare - Suggests an optimal fare based on multiple factors.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestRideFareInputSchema = z.object({
    origin: z.string().describe('Starting location of the ride.'),
    destination: z.string().describe('Destination of the ride.'),
    distance: z.number().optional().describe('Estimated distance in kilometers.'),
    time: z.string().describe('Departure time (e.g., 9:00 AM).'),
    dayOfWeek: z.string().describe('Day of the week (e.g., Monday).'),
    seatsAvailable: z.number().describe('Number of seats being offered.'),
    academicEvent: z.string().optional().describe('Any ongoing academic event (exams, fest, placement).'),
    isRecurring: z.boolean().optional().describe('Whether this is a daily recurring ride.'),
});
export type SuggestRideFareInput = z.infer<typeof SuggestRideFareInputSchema>;

const SuggestRideFareOutputSchema = z.object({
    suggestedFare: z.number().describe('Recommended fare per person in INR.'),
    fareRange: z.object({
        min: z.number().describe('Minimum acceptable fare.'),
        max: z.number().describe('Maximum fair fare.'),
    }),
    breakdown: z.object({
        baseFare: z.number().describe('Base fare for the distance.'),
        peakMultiplier: z.number().describe('Peak hour multiplier (1.0 = no surge).'),
        eventAdjustment: z.number().describe('Event-based adjustment in INR.'),
        recurringDiscount: z.number().describe('Discount for recurring rides in INR.'),
    }),
    explanation: z.string().describe('Clear explanation of how the fare was calculated.'),
    competitiveAnalysis: z.string().describe('How this compares to alternatives (auto, cab, bus).'),
    tip: z.string().describe('Tip for the driver to attract more passengers.'),
});
export type SuggestRideFareOutput = z.infer<typeof SuggestRideFareOutputSchema>;

export async function suggestRideFare(input: SuggestRideFareInput): Promise<SuggestRideFareOutput> {
    return suggestRideFareFlow(input);
}

const prompt = ai.definePrompt({
    name: 'suggestRideFarePrompt',
    input: { schema: SuggestRideFareInputSchema },
    output: { schema: SuggestRideFareOutputSchema },
    prompt: `You are an AI fare advisor for student ride-sharing in Knowledge Park, Greater Noida.

Your goal is to suggest FAIR and COMPETITIVE fares that benefit both drivers and passengers.

## Fare Guidelines (Greater Noida Student Context):
- **Base Rate**: ₹8-10 per kilometer for short distances
- **Minimum Fare**: ₹20-30 for very short trips
- **Peak Hours**: 1.2x-1.5x during 8-10 AM and 4-6 PM
- **Event Surge**: +₹10-20 during exams, placements, fests
- **Recurring Discount**: -₹5-10 for daily commuters

## Competitive Reference (for students):
- Auto-rickshaw: ₹15-20 base + ₹10/km
- Ola/Uber: ₹12-15/km + surge
- Shared ride (ideal): 30-50% cheaper than solo cab

## Common Routes & Fair Prices:
- Knowledge Park ↔ Pari Chowk: ₹30-50
- Knowledge Park ↔ Alpha 1: ₹40-60
- Knowledge Park ↔ Noida Sector 62: ₹80-120
- Knowledge Park ↔ Botanical Garden: ₹100-150

## Input:
- Origin: {{{origin}}}
- Destination: {{{destination}}}
{{#if distance}}
- Distance: {{{distance}}} km
{{/if}}
- Time: {{{time}}}
- Day: {{{dayOfWeek}}}
- Seats Available: {{{seatsAvailable}}}
{{#if academicEvent}}
- Academic Event: {{{academicEvent}}}
{{/if}}
{{#if isRecurring}}
- Recurring Ride: Yes (daily commute)
{{/if}}

## Calculate:
1. Base fare from distance/route
2. Apply peak multiplier if applicable
3. Add event adjustment if needed
4. Apply recurring discount if applicable
5. Suggest a final fare that's fair for students

Remember: Students have limited budgets. Price competitively to encourage ride-sharing adoption.`,
});

const suggestRideFareFlow = ai.defineFlow(
    {
        name: 'suggestRideFareFlow',
        inputSchema: SuggestRideFareInputSchema,
        outputSchema: SuggestRideFareOutputSchema,
    },
    async input => {
        const { output } = await prompt(input);
        return output!;
    }
);
