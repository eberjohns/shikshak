'use client';

import useSWR from 'swr';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/context/auth-context';
import * as examService from '@/services/examService';
import { Exam } from '@/lib/types';

const examsFetcher = (url: string) => {
    const studentId = parseInt(url.split('/')[3]);
    return examService.getExamHistory(studentId);
};

export default function ExamsPage() {
    const { user } = useAuth();
    const { data: exams, error } = useSWR(user ? `/api/exams/history/${user.id}` : null, examsFetcher);

    if (error) return <div className="text-destructive">Failed to load exams.</div>;
    if (!exams) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
                <p className="text-muted-foreground">Review your past performance and see upcoming exams.</p>
            </div>
            <Card>
                <CardContent className="p-0">
                    <ul className="divide-y divide-border">
                        {exams.map((exam: any) => ( // Using 'any' to accommodate new backend fields
                             <li key={exam.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                <div>
                                    <p className="font-semibold">{exam.title}</p>
                                    <p className="text-sm text-muted-foreground">{exam.course_name || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    {exam.status === 'Graded' && exam.score && <p className="font-bold text-lg text-primary">{exam.score}</p>}
                                    <Badge variant={
                                        exam.status === 'Graded' ? 'default' :
                                        exam.status === 'Pending' ? 'secondary' : 'outline'
                                    }
                                    className={exam.status === 'Graded' ? 'bg-green-600 text-white' : ''}
                                    >
                                        {exam.status}
                                    </Badge>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}