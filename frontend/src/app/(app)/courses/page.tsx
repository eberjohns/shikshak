'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import useSWR, { mutate } from 'swr';
import * as courseService from '@/services/courseService';
import { Course } from '@/lib/types';
import { PlusCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';

const coursesFetcher = (teacherId: number) => courseService.getCourses(teacherId);

export default function CoursesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newCourseName, setNewCourseName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { data: courses, error, isLoading } = useSWR(user?.id, coursesFetcher);

  const handleCreateCourse = async () => {
    if (!newCourseName.trim() || !user) return;

    setIsCreating(true);
    try {
      await courseService.createCourse(newCourseName, user.id);
      toast({ title: 'Course Created!', description: `Successfully created "${newCourseName}".` });
      setNewCourseName('');
      mutate(user.id); // Re-fetch the courses list
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create course.' });
    } finally {
      setIsCreating(false);
    }
  };
  
  if (!user || user.role !== 'teacher') {
    return <div className="text-destructive">You are not authorized to view this page.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Courses</h1>
        <p className="text-muted-foreground">Manage your existing courses or create a new one.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Course</CardTitle>
              <CardDescription>Enter a name for your new course below.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="course-name">Course Name</Label>
                <Input
                  id="course-name"
                  placeholder="e.g., Introduction to Science"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  disabled={isCreating}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreateCourse} disabled={isCreating || !newCourseName.trim()} className="w-full">
                {isCreating ? 'Creating...' : <><PlusCircle className="mr-2 h-4 w-4" /> Create Course</>}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Existing Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && <p>Loading courses...</p>}
              {error && <p className="text-destructive">Could not load courses.</p>}
              {courses && courses.length > 0 ? (
                <ul className="space-y-3">
                  {courses.map((course: Course) => (
                    <li key={course.id}>
                      <Link href={`/dashboard/teacher/${course.id}`}>
                        <div className="flex items-center gap-4 rounded-md border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <span className="font-medium">{course.name}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                !isLoading && <p className="text-muted-foreground">You haven't created any courses yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}