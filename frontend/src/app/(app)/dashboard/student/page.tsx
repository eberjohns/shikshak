
"use client";
import { useEffect, useState } from "react";
import { useAuth } from '@/context/auth-context';
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";


export default function StudentDashboard() {
  const { user } = useAuth();
  const [focusTopics, setFocusTopics] = useState<any[]>([]);
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'student') return;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch dashboard topics
  const dashRes = await axios.get(`http://localhost:8000/dashboard/student`, { params: { student_id: user!.id } });
        setFocusTopics(
          dashRes.data.topics.map((t: any) => ({
            name: t.topic,
            accuracy: t.accuracy,
            commonError: t.common_errors && Object.keys(t.common_errors).length > 0
              ? Object.keys(t.common_errors)[0]
              : "none"
          }))
        );

        // Fetch available exams from backend
        const examsRes = await axios.get(`http://localhost:8000/exams/available`, { params: { student_id: user!.id } });
        setAvailableExams(examsRes.data.exams);
      } catch (err: any) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (!user || user.role !== 'student') return <div className="text-destructive">Not logged in as a student.</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Alex! Here's your performance overview.</p>
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
              {focusTopics.map(topic => (
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
            {availableExams.map(exam => (
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
