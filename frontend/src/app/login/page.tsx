'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import axios from 'axios';
import { BookOpenCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {

  const { loginStudent, registerStudent, loginTeacher } = useAuth();
  const { toast } = useToast();

  // Student registration
  const [studentName, setStudentName] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  // Student login
  const [students, setStudents] = useState<{ id: number; name: string }[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Teacher login
  const [teacherLoading, setTeacherLoading] = useState(false);

  // Fetch students for login
  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/students');
      setStudents(res.data);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch students.' });
    } finally {
      setStudentsLoading(false);
    }
  };

  // Register student
  const handleRegister = async () => {
    if (!studentName.trim()) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: 'Please enter your name.' });
      return;
    }
    setRegisterLoading(true);
    const result = await registerStudent(studentName.trim());
    setRegisterLoading(false);
    if (result.success) {
      toast({ title: 'Registration Successful', description: 'Welcome!' });
    } else {
      toast({ variant: 'destructive', title: 'Registration Failed', description: result.error || 'Unknown error.' });
    }
  };

  // Student login
  const handleStudentLogin = async () => {
    if (!selectedStudentId) {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Please select your name.' });
      return;
    }
    const ok = await loginStudent(selectedStudentId);
    if (!ok) {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid student.' });
    }
  };

  // Teacher login
  const handleTeacherLogin = async () => {
    setTeacherLoading(true);
    const ok = await loginTeacher();
    setTeacherLoading(false);
    if (!ok) {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Teacher login failed.' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground overflow-hidden shadow-lg">
            <img src="/static/1.png" alt="Logo" className="h-full w-full object-cover" />
          </div>
          <CardTitle className="font-headline text-3xl">Shikshak</CardTitle>
          <CardDescription>
            AI-Assisted Exam Creation & Grading
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Student Registration */}
          <div className="space-y-2">
            <Label htmlFor="student-name">Register as Student</Label>
            <div className="flex gap-2">
              <Input
                id="student-name"
                type="text"
                placeholder="Enter your name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="text-base"
                onKeyUp={(e) => e.key === 'Enter' && handleRegister()}
                disabled={registerLoading}
              />
              <Button onClick={handleRegister} disabled={registerLoading}>
                {registerLoading ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </div>

          {/* Student Login */}
          <div className="space-y-2">
            <Label>Login as Student</Label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchStudents} disabled={studentsLoading}>
                {studentsLoading ? 'Loading...' : 'Show Students'}
              </Button>
              <select
                className="border rounded px-2 py-1 text-base"
                value={selectedStudentId ?? ''}
                onChange={e => setSelectedStudentId(Number(e.target.value))}
                disabled={studentsLoading || students.length === 0}
                style={{ minWidth: 120 }}
              >
                <option value="">Select</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <Button onClick={handleStudentLogin} disabled={studentsLoading || !selectedStudentId}>
                Login
              </Button>
            </div>
          </div>

          {/* Teacher Login */}
          <div className="space-y-2">
            <Label>Login as Teacher</Label>
            <Button onClick={handleTeacherLogin} disabled={teacherLoading} className="w-full">
              {teacherLoading ? 'Logging in...' : 'Login as Teacher'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
