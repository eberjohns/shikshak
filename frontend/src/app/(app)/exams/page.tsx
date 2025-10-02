import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const exams = [
    { id: 1, title: 'Midterm Exam', course: 'Advanced Biology', status: 'Graded', score: '85/100' },
    { id: 2, title: 'Pop Quiz', course: 'Introduction to Physics', status: 'Pending', score: null },
    { id: 3, title: 'Final Exam', course: 'Advanced Biology', status: 'Not Taken', score: null },
];

export default function ExamsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
                <p className="text-muted-foreground">Review your past performance and see upcoming exams.</p>
            </div>
            <Card>
                <CardContent className="p-0">
                    <ul className="divide-y divide-border">
                        {exams.map(exam => (
                             <li key={exam.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                <div>
                                    <p className="font-semibold">{exam.title}</p>
                                    <p className="text-sm text-muted-foreground">{exam.course}</p>
                                </div>
                                <div className="text-right">
                                    {exam.status === 'Graded' && <p className="font-bold text-lg text-primary">{exam.score}</p>}
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
