'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from '@/context/auth-context';
import useSWR from 'swr';
import * as courseService from '@/services/courseService';
import { Course } from '@/lib/types';
import { PlusCircle, ArrowRight } from "lucide-react";

const coursesFetcher = (teacherId: number) => courseService.getCourses(teacherId);

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data: courses, isLoading } = useSWR(user?.id, coursesFetcher);

  if (!user || user.role !== 'teacher') {
    return <div className="text-destructive">Not authorized.</div>;
  }
  
  if (isLoading) {
      return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.full_name}! Select a course to view its dashboard.</p>
      </div>

      {courses && courses.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {courses.map((course: Course) => (
              <Link key={course.id} href={`/dashboard/teacher/${course.id}`}>
                <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                  <p className="font-semibold">{course.name}</p>
                  <Button variant="ghost" size="sm">
                    View Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center">
            <CardHeader>
                <CardTitle>No Courses Found</CardTitle>
                <CardDescription>You haven't created any courses yet. Get started by creating your first one!</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/courses">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Your First Course
                    </Link>
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}