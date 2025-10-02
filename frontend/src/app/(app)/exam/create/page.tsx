import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function CreateExamPage() {
    return (
        <div className="flex h-full flex-col items-center justify-center p-8">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Wrench className="h-8 w-8" />
                    </div>
                    <CardTitle>Under Construction</CardTitle>
                    <CardDescription>The exam creation interface is being built.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">This feature will allow teachers to build exams with both objective and subjective questions, powered by AI suggestions.</p>
                </CardContent>
            </Card>
        </div>
    )
}
