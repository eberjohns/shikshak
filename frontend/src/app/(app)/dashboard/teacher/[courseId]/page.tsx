'use client'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import Link from "next/link";
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Users, AlertCircle, PlusCircle, ArrowRight } from "lucide-react";

const chartData = [
  { topic: "Cellular Respiration", errors: 12 },
  { topic: "Genetics", errors: 8 },
  { topic: "Photosynthesis", errors: 5 },
];

const chartConfig = {
    errors: {
        label: "Errors",
        color: "hsl(var(--destructive))",
    },
} satisfies ChartConfig;

const recentExams = [
    { id: 1, title: "Midterm Exam", submissions: 2, status: 'Needs Grading' },
    { id: 2, title: "Quiz 1", submissions: 15, status: 'Graded' },
]

export default function TeacherDashboard({ params }: { params: { courseId: string } }) {
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'teacher') return;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch course info (replace with real endpoint if available)
        // For now, just set courseId
        setCourse({ id: parseInt(params.courseId), name: `Course #${params.courseId}` });

        // Fetch teacher dashboard data
        const dashRes = await axios.get(`http://localhost:8000/dashboard/teacher/${params.courseId}`);
        setDashboard(dashRes.data);
      } catch (err: any) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, params.courseId]);

  if (!user || user.role !== 'teacher') return <div className="text-destructive">Not logged in as a teacher.</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!course || !dashboard) return <div>No data.</div>;

  // Prepare chart data
  const chartData = (dashboard.misunderstood_topics || []).map((t: any) => ({
    topic: t.topic,
    errors: Object.values(t.errors || {}).reduce((a: any, b: any) => a + b, 0)
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard: {course.name}</h1>
            <p className="text-muted-foreground">Overview of your class performance and activities.</p>
        </div>
        <Button asChild>
            <Link href="/exam/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Exam
            </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{dashboard.class_average ?? '--'}%</div>
                <p className="text-xs text-muted-foreground">Class average</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{dashboard.student_highlights?.length ?? '--'}</div>
                <p className="text-xs text-muted-foreground">in this course</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Items for Review</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{dashboard.misunderstood_topics?.length ?? '--'}</div>
                <p className="text-xs text-muted-foreground">subjective answers</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Misunderstood Topics</CardTitle>
            <CardDescription>Topics with the highest number of incorrect answers.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="topic" type="category" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} width={120} />
                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                        <Bar dataKey="errors" fill="var(--color-errors)" radius={4} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Student Highlights</CardTitle>
            <CardDescription>Students with lowest average scores.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.student_highlights?.map((s: any) => (
              <div key={s.student_id} className="flex items-center justify-between rounded-lg border p-4  hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-muted-foreground">Avg Score: {s.avg_score}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
