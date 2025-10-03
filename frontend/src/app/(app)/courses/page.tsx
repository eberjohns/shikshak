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
import { PlusCircle, BookOpen, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
  
  const handleDeleteCourse = async (courseId: number, courseName: string) => {
    if (!user) return;

    try {
      await courseService.deleteCourse(courseId, user.id);
      toast({ title: 'Course Deleted', description: `Successfully deleted "${courseName}".` });
      mutate(user.id); // Re-fetch the courses list
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete course.' });
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
                    <li key={course.id} className="flex items-center justify-between gap-2">
                      <Link href={`/dashboard/teacher/${course.id}`} className="w-full">
                        <div className="flex items-center gap-4 rounded-md border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <span className="font-medium">{course.name}</span>
                        </div>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the course
                              and all associated exams and student data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCourse(course.id, course.name)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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