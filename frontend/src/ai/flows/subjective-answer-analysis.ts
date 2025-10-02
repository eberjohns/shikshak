'use server';
/**
 * @fileOverview Analyzes a student's subjective answer using AI based on teacher-defined grading rules.
 *
 * - analyzeSubjectiveAnswer - Analyzes the answer and provides feedback.
 * - AnalyzeSubjectiveAnswerInput - Input type for the analysis.
 * - AnalyzeSubjectiveAnswerOutput - Output type containing error analysis and feedback.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSubjectiveAnswerInputSchema = z.object({
  studentAnswer: z.string().describe('The student\u0027s answer to the question.'),
  gradingRules: z.string().describe('The grading rules provided by the teacher.'),
});
export type AnalyzeSubjectiveAnswerInput = z.infer<typeof AnalyzeSubjectiveAnswerInputSchema>;

const AnalyzeSubjectiveAnswerOutputSchema = z.object({
  errorAnalysis: z.string().describe('The type of error identified (conceptual, interpretational, procedural, or none).'),
  feedback: z.string().describe('AI-generated feedback for the student\u0027s answer.'),
});
export type AnalyzeSubjectiveAnswerOutput = z.infer<typeof AnalyzeSubjectiveAnswerOutputSchema>;

export async function analyzeSubjectiveAnswer(input: AnalyzeSubjectiveAnswerInput): Promise<AnalyzeSubjectiveAnswerOutput> {
  return analyzeSubjectiveAnswerFlow(input);
}

const analyzeSubjectiveAnswerPrompt = ai.definePrompt({
  name: 'analyzeSubjectiveAnswerPrompt',
  input: {schema: AnalyzeSubjectiveAnswerInputSchema},
  output: {schema: AnalyzeSubjectiveAnswerOutputSchema},
  prompt: `Analyze the student's answer based on the grading rules and identify the type of error.

Student's Answer: {{{studentAnswer}}}
Grading Rules: {{{gradingRules}}}

Consider these error types: conceptual, interpretational, procedural, none.

Provide feedback to the student based on your analysis.  Make sure to set the errorAnalysis field to one of the allowed values: conceptual, interpretational, procedural, or none.

Ensure the errorAnalysis and feedback are helpful to the teacher for grading.`,
});

const analyzeSubjectiveAnswerFlow = ai.defineFlow(
  {
    name: 'analyzeSubjectiveAnswerFlow',
    inputSchema: AnalyzeSubjectiveAnswerInputSchema,
    outputSchema: AnalyzeSubjectiveAnswerOutputSchema,
  },
  async input => {
    const {output} = await analyzeSubjectiveAnswerPrompt(input);
    return output!;
  }
);
