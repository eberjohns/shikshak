'use client'

import { useState } from 'react';
import type { Question, Submission, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { analyzeSubjectiveAnswer } from '@/ai/flows/subjective-answer-analysis';
import { Sparkles, Bot, User as UserIcon, Check, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import useSWR from 'swr';
import * as examService from '@/services/examService';
import * as gradingService from '@/services/gradingService';

const fetcher = (url: string) => {
    if (url.includes('submissions')) {
        return gradingService.getSubmissions(url.split('/')[2]);
    }
    if (url.includes('students')) {
        return gradingService.getStudent(parseInt(url.split('/')[2]));
    }
    return examService.getExam(url.split('/')[2]);
};


function SubjectiveGradingCard({ question, studentAnswer, answerId, onUpdate }: { question: Question, studentAnswer: string, answerId: number, onUpdate: (answerId: number, score: number, feedback: string) => void }) {
    const [analysis, setAnalysis] = useState<{ errorAnalysis: string; feedback: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [score, setScore] = useState([5]);
    const [feedback, setFeedback] = useState("");
    const { toast } = useToast();

    const handleAnalyze = async () => {
        if (!question.grading_rules) return;
        setIsLoading(true);
        try {
            const result = await analyzeSubjectiveAnswer({
                studentAnswer: studentAnswer,
                gradingRules: question.grading_rules,
            });
            setAnalysis(result);
            setFeedback(result.feedback);
        } catch (error) {
            console.error("AI analysis failed:", error);
            toast({
                variant: 'destructive',
                title: 'AI Analysis Failed',
                description: 'Could not get analysis from AI. Please grade manually.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            await gradingService.reviewGrading(answerId, score[0], feedback, score[0] > 0 ? "true" : "false");
            onUpdate(answerId, score[0], feedback);
            toast({ title: 'Grade Approved', description: 'The grade has been saved.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save grade.' });
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle className="text-lg">{question.question_text}</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                    <h3 className="font-semibold flex items-center"><UserIcon className="mr-2 h-4 w-4" />Student's Answer</h3>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md min-h-[150px]">{studentAnswer}</p>
                    <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isLoading ? 'Analyzing...' : 'Analyze with AI'}
                    </Button>
                </div>

                <div className="md:col-span-1 space-y-4">
                     <h3 className="font-semibold flex items-center"><Bot className="mr-2 h-4 w-4" />AI Analysis</h3>
                     <div className="text-sm bg-muted p-3 rounded-md min-h-[150px]">
                        {analysis ? (
                            <div className="space-y-2">
                                <p><strong>Error Type:</strong> <Badge variant="destructive">{analysis.errorAnalysis}</Badge></p>
                                <p><strong>Feedback:</strong> {analysis.feedback}</p>
                            </div>
                        ) : (
                            <p className="text-muted-foreground italic">Click "Analyze with AI" to see suggestions.</p>
                        )}
                     </div>
                </div>

                <div className="md:col-span-1 space-y-4">
                    <h3 className="font-semibold flex items-center"><Edit className="mr-2 h-4 w-4" />Teacher's Action</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Score</Label>
                            <span className="font-bold text-primary">{score[0]} / 10</span>
                        </div>
                        <Slider defaultValue={[5]} max={10} step={1} value={score} onValueChange={setScore}/>
                    </div>
                    <div className="space-y-2">
                         <Label>Final Feedback</Label>
                         <Textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={4} />
                    </div>
                     <Button onClick={handleApprove} className="w-full"><Check className="mr-2 h-4 w-4" />Approve & Save</Button>
                </div>
            </CardContent>
        </Card>
    );
}


export default function GradeExamPage({ params }: { params: { examId: string } }) {
    const { data: exam, error: examError } = useSWR(`/api/exams/${params.examId}`, fetcher);
    const { data: submissions, error: submissionsError } = useSWR(`/api/exams/${params.examId}/submissions`, fetcher);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

    const { data: student, error: studentError } = useSWR(selectedStudentId ? `/api/students/${selectedStudentId}` : null, fetcher);

    const handleUpdateGrade = (answerId: number, score: number, feedback: string) => {
        // In a real app, you'd send this to your backend
        console.log(`Updating grade for answer ${answerId}: score ${score}, feedback: "${feedback}"`);
    };

    if (examError || submissionsError) return <div>Failed to load data.</div>;
    if (!exam || !submissions) return <div>Loading...</div>;

    const selectedSubmission = submissions.find((s: Submission) => s.studentId === selectedStudentId);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Grade Exam: {exam.title}</h1>
                <p className="text-muted-foreground">Review student submissions and provide feedback.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Submissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                            {submissions.map((sub: Submission) => (
                                <li key={sub.studentId}>
                                    <Button
                                        variant={selectedStudentId === sub.studentId ? 'secondary' : 'ghost'}
                                        className="w-full justify-start"
                                        onClick={() => setSelectedStudentId(sub.studentId)}
                                    >
                                        {sub.studentName}
                                    </Button>
                                </li>
                            ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-3 space-y-6">
                    {selectedSubmission && student ? (
                        <>
                            <h2 className="text-2xl font-semibold">
                                Grading for: <span className="text-primary">{student.full_name}</span>
                            </h2>
                            {selectedSubmission.answers.map((answer: any) => {
                                if (answer.question.question_type !== 'subjective') return null;

                                return (
                                    <SubjectiveGradingCard
                                        key={answer.id}
                                        question={answer.question}
                                        studentAnswer={answer.answer_text}
                                        answerId={answer.id}
                                        onUpdate={(answerId, score, feedback) => handleUpdateGrade(answerId, score, feedback)}
                                    />
                                );
                            })}
                        </>
                    ) : <p>Select a student to start grading.</p>}
                </div>
            </div>
        </div>
    );
}