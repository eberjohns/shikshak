"use client";
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useSWR from 'swr';
import * as dashboardService from '@/services/dashboardService';
import * as examService from '@/services/examService';

const fetcher = (url: string) => dashboardService.getStudentDashboard(parseInt(url.split('=')[1]));
const examsFetcher = (url: string) => examService.getAvailableExams(parseInt(url.split('=')[1]));

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: focusTopicsData, error: focusTopicsError } = useSWR(user ? `/dashboard/student?student_id=${user.id}` : null, fetcher);
  const { data: availableExamsData, error: availableExamsError } = useSWR(user ? `/exams/available?student_id=${user.id}` : null, examsFetcher);

  if (!user || user.role !== 'student') {
    return <div className="text-destructive">Not logged in as a student.</div>;
  }
  if (focusTopicsError || availableExamsError) {
    return <div className="text-destructive">Failed to load dashboard data.</div>;
  }
  if (!focusTopicsData || !availableExamsData) {
     return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg
              className="mr-2 h-5 w-5 animate-spin text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </div>
        </div>
      );
  }

  const focusTopics = focusTopicsData.topics.map((t: any) => ({
      name: t.topic,
      accuracy: t.accuracy,
      commonError: t.common_errors && Object.keys(t.common_errors).length > 0
        ? Object.keys(t.common_errors)[0]
        : "none"
    }));

  const availableExams = availableExamsData;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.full_name}! Here's your performance overview.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Topics to Focus On</span>
            </CardTitle>
            <CardDescription>Based on your recent performance, here are some areas for improvement.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {focusTopics.map((topic: any) => (
                <li key={topic.name} className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{topic.name}</p>
                    <span className="text-sm text-muted-foreground">Common error type: <Badge variant="destructive">{topic.commonError}</Badge></span>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className={`text-lg font-bold ${topic.accuracy < 70 ? 'text-destructive' : 'text-green-600'}`}>{topic.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Available Exams</CardTitle>
            <CardDescription>Ready to test your knowledge?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableExams.map((exam: any) => (
              <div key={exam.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-semibold">{exam.title}</p>
                  <p className="text-sm text-muted-foreground">{exam.course} &bull; {exam.questions} questions</p>
                </div>
                {exam.status !== 'completed' ? (
                  <Button asChild>
                    <Link href={`/exam/${exam.id}/take`}>
                      Start Exam <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>Completed</Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}