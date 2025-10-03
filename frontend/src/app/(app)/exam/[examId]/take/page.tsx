'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function TakeExamPage({ params }: { params: { examId: string } }) {

  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExam() {
      setLoading(true);
      setError(null);
      try {
        // Fetch exam info
        const examRes = await axios.get(`http://localhost:8000/exams/${params.examId}`);
        setExam(examRes.data);
        // Fetch questions for this exam
        const questionsRes = await axios.get(`http://localhost:8000/exams/${params.examId}/questions`);
        setQuestions(questionsRes.data);
      } catch (err) {
        setError('Failed to load exam.');
      } finally {
        setLoading(false);
      }
    }
    fetchExam();
  }, [params.examId]);

  if (!user || user.role !== 'student') return <div className="text-destructive">Not logged in as a student.</div>;
  if (loading) return <div>Loading...</div>;
  if (error || !exam || !questions.length) return <div className="text-destructive">Exam not found.</div>;

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Prepare answers for backend
      const answerList = Object.entries(answers).map(([question_id, answer_text]) => ({
        question_id: Number(question_id),
        answer_text,
      }));
      await axios.post(`http://localhost:8000/exams/${params.examId}/submit`, {
        student_id: user.id,
        answers: answerList,
      });
      toast({
        title: "Exam Submitted!",
        description: "Your answers have been recorded.",
      });
      router.push('/dashboard/student');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not submit your answers.',
      });
    }
  };

  return (
    <div className="flex justify-center items-start p-4 sm:p-6 lg:p-8 min-h-full">
        <Card className="w-full max-w-3xl">
        <CardHeader>
            <div className="flex justify-between items-center mb-4">
                <CardTitle className="text-2xl">{exam.title}</CardTitle>
                <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>
            </div>
            <Progress value={progress} />
        </CardHeader>
        <CardContent>
            <div className="space-y-6">
                <p className="text-lg font-medium">{currentQuestion.question_text}</p>
                {currentQuestion.question_type === 'objective' && currentQuestion.options && (
                    <RadioGroup 
                        value={answers[currentQuestion.id] || ''}
                        onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                        className="space-y-2"
                    >
                    {Object.entries(currentQuestion.options).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent/50 hover:text-accent-foreground has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10 transition-colors">
                            <RadioGroupItem value={key} id={`option-${key}`} />
                            <Label htmlFor={`option-${key}`} className="flex-1 cursor-pointer text-base">{String(value)}</Label>
                        </div>
                    ))}
                    </RadioGroup>
                )}
                {currentQuestion.question_type === 'subjective' && (
                    <Textarea
                        placeholder="Type your answer here..."
                        rows={10}
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    />
                )}
            </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={handleNext}>Next</Button>
            ) : (
                <Button onClick={handleSubmit}>Submit Exam</Button>
            )}
        </CardFooter>
        </Card>
    </div>
  );
}
