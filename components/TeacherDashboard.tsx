'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Upload, Camera, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookMarked, CheckCircle2, Clock } from "lucide-react";

interface Student {
  id: number;
  name: string;
  rollNumber: string;
  attendance: 'present' | 'absent' | null;
}

interface Class {
  id: number;
  class_name: string;
  section: string;
  class_teacher_id: number | null;
  teacher_name: string | null;
  academic_year: string;
  student_count: number;
  created_at: string;
}

interface ClassesResponse {
  classes: Class[];
  summary: {
    totalClasses: number;
    totalSections: number;
    totalStudents: number;
  };
}

interface AttendanceData {
  student_id: number;
  status: 'present' | 'absent';
}

interface AttendanceStatus {
  submitted: boolean;
}

interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface Homework {
  id: number;
  title: string;
  description: string;
  class_id: number;
  subject_id: number;
  due_date: string;
  status: "pending" | "completed";
  assigned_by: string;
}

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

interface Teacher {
  id: number;
  teacher_id: number;
  user_id: number;
  created_at: string;
}

interface TeacherDashboardContentProps {}

const TeacherDashboardContent: React.FC<TeacherDashboardContentProps> = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [homeworkTitle, setHomeworkTitle] = useState('');
  const [homeworkDescription, setHomeworkDescription] = useState('');
  const [homeworkDueDate, setHomeworkDueDate] = useState<Date>(new Date());
  const [attachments, setAttachments] = useState<File[]>([]);
  const [cameraImage, setCameraImage] = useState<string | null>(null);
  const [attendanceSubmitted, setAttendanceSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [showHomeworkForm, setShowHomeworkForm] = useState(false);
  const [newHomework, setNewHomework] = useState({
    title: "",
    description: "",
    class_id: "",
    subject_id: "",
    due_date: new Date(),
  });
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  // Today's timetable (filter by today's date)
  const [todaysTimetable, setTodaysTimetable] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    const fetchTimetable = async () => {
      try {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const response = await fetch(`/api/timetable?teacher_id=${user.id}&day_of_week=${dayOfWeek}`);
        if (!response.ok) throw new Error('Failed to fetch timetable');
        const data = await response.json();
        setTodaysTimetable(data);
      } catch (error) {
        setTodaysTimetable([]);
      }
    };
    fetchTimetable();
  }, [user]);

  // Notices from admin (dummy or fetch from /api/notices)
  const [notices, setNotices] = useState<any[]>([]);
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch('/api/notices?audience=teacher');
        if (!response.ok) throw new Error('Failed to fetch notices');
        const data = await response.json();
        setNotices(data);
      } catch (error) {
        setNotices([]);
      }
    };
    fetchNotices();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      }
    };

    fetchUser();
  }, []);

  // Fetch teacher data after user is loaded
  useEffect(() => {
    if (!user) return;

    const fetchTeacher = async () => {
      try {
        const response = await fetch(`/api/teachers/by-user/${user.id}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch teacher data');
        }
        const teacherData = await response.json();
        setTeacher(teacherData);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        toast.error('Failed to load teacher data');
      }
    };

    fetchTeacher();
  }, [user]);

  // Fetch available classes for the logged-in teacher
  useEffect(() => {
    if (!mounted || !user) return;

    const fetchClasses = async () => {
      try {
        setIsLoadingClasses(true);
        setError(null);
        
        const response = await fetch('/api/classes/by-teacher');
        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data.classes)) {
          throw new Error('Invalid classes data received');
        }

        // Ensure unique classes by ID
        const uniqueClasses = data.classes.reduce((acc: Class[], current: Class) => {
          const exists = acc.find(item => item.id === current.id);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);

        setClasses(uniqueClasses);
        console.log('Processed classes:', uniqueClasses);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError(error instanceof Error ? error.message : 'Failed to load classes');
        setClasses([]);
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [mounted, user]);

  // Fetch students when class is selected
  useEffect(() => {
    if (!selectedClass || !selectedDate) return;

    const fetchStudents = async () => {
      try {
        setIsLoadingStudents(true);
        setError(null);

        const response = await fetch(`/api/students/by-class/${selectedClass}`);
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }

        const data = await response.json();
        
        if (!Array.isArray(data.students)) {
          throw new Error('Invalid students data received');
        }

        // Ensure unique students by ID
        const uniqueStudents = data.students.reduce((acc: Student[], current: Student) => {
          const exists = acc.find(item => item.id === current.id);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);

        setStudents(uniqueStudents);
        console.log('Processed students:', uniqueStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError(error instanceof Error ? error.message : 'Failed to load students');
        setStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedClass, selectedDate]);

  // Fetch subjects for selected class
  useEffect(() => {
    if (!selectedClass) return;

    const fetchSubjects = async () => {
      try {
        const response = await fetch(`/api/subjects/by-class?classId=${selectedClass}`);
        if (!response.ok) {
          throw new Error('Failed to fetch subjects');
        }
        const data = await response.json();
        
        // Validate subject data
        const validSubjects = data.filter((subject: any): subject is Subject => 
          typeof subject === 'object' && 
          subject !== null && 
          typeof subject.id === 'number' && 
          typeof subject.subject_name === 'string' && 
          typeof subject.subject_code === 'string' &&
          (subject.description === null || typeof subject.description === 'string') &&
          typeof subject.created_at === 'string' &&
          typeof subject.updated_at === 'string'
        );

        if (validSubjects.length !== data.length) {
          console.error('Some subjects data was invalid:', data);
          toast.error('Some subjects data was invalid');
        }

        setSubjects(validSubjects);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast.error('Failed to load subjects');
        setSubjects([]);
      }
    };

    fetchSubjects();
  }, [selectedClass]);

  // Fetch homework for selected class
  useEffect(() => {
    if (!selectedClass) return;

    const fetchHomework = async () => {
      try {
        const response = await fetch(`/api/homework?class_id=${selectedClass}`);
        if (!response.ok) {
          throw new Error('Failed to fetch homework');
        }
        const data = await response.json();
        setHomework(data);
      } catch (error) {
        console.error('Error fetching homework:', error);
        toast.error('Failed to load homework');
      }
    };

    fetchHomework();
  }, [selectedClass]);

  const handleAttendanceChange = (studentId: number, status: 'present' | 'absent') => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, attendance: status } : student
    ));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) {
      toast.error('Please select a class first');
      return;
    }

    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: dateStr,
          class_id: selectedClass,
          attendance: students.map(student => ({
            student_id: student.id,
            status: student.attendance
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save attendance');
      }

      toast.success('Attendance saved successfully!');
      setAttendanceSubmitted(true);
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAttachments(Array.from(event.target.files));
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      const image = canvas.toDataURL('image/jpeg');
      setCameraImage(image);

      // Stop the video stream
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error capturing image:', error);
      toast.error('Failed to capture image. Please try again.');
    }
  };

  const handleSubmitHomework = async () => {
    if (!selectedClass) {
      toast.error('Please select a class first');
      return;
    }

    if (!homeworkTitle || !homeworkDescription) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', homeworkTitle);
      formData.append('description', homeworkDescription);
      formData.append('due_date', homeworkDueDate.toISOString());
      formData.append('class_id', selectedClass);
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      if (cameraImage) {
        const response = await fetch(cameraImage);
        const blob = await response.blob();
        formData.append('camera_image', blob, 'camera.jpg');
      }

      const response = await fetch('/api/homework', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit homework');
      }

      toast.success('Homework assigned successfully!');
      setHomeworkTitle('');
      setHomeworkDescription('');
      setHomeworkDueDate(new Date());
      setAttachments([]);
      setCameraImage(null);
    } catch (error) {
      console.error('Error submitting homework:', error);
      toast.error('Failed to submit homework. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleHomeworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/homework", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newHomework.title,
          description: newHomework.description,
          class_id: parseInt(selectedClass),
          subject_id: parseInt(newHomework.subject_id),
          due_date: format(newHomework.due_date, "yyyy-MM-dd")
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create homework");
      }

      toast.success("Homework assigned successfully");
      setShowHomeworkForm(false);
      setNewHomework({
        title: "",
        description: "",
        class_id: "",
        subject_id: "",
        due_date: new Date(),
      });
      
      // Refresh homework list
      const updatedResponse = await fetch(`/api/homework?class_id=${selectedClass}`);
      if (updatedResponse.ok) {
        const data = await updatedResponse.json();
        setHomework(data);
      }
    } catch (error) {
      console.error("Error creating homework:", error);
      toast.error("Failed to assign homework");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-6">
        {/* Assigned Classes/Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Classes & Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingClasses ? (
              <div>Loading classes...</div>
            ) : classes.length === 0 ? (
              <div>No assigned classes.</div>
            ) : (
              <ul className="space-y-2">
                {classes.map((cls) => (
                  <li key={cls.id} className="flex items-center gap-2">
                    <span className="font-medium">{cls.class_name} - {cls.section}</span>
                    <Badge variant="outline">{cls.academic_year}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Today's Timetable */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Timetable</CardTitle>
          </CardHeader>
          <CardContent>
            {todaysTimetable.length === 0 ? (
              <div>No classes scheduled for today.</div>
            ) : (
              <ul className="space-y-2">
                {todaysTimetable.map((entry, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span>{entry.start_time} - {entry.end_time}:</span>
                    <span className="font-medium">{entry.class_name} ({entry.section})</span>
                    <span className="text-gray-500">{entry.subject_name}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Mark Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Use existing attendance UI for selected class/date */}
            {/* ...existing attendance UI code... */}
            {/* (Keep the class/date selection and student list/marking logic) */}
            {/* ...existing code for attendance... */}
          </CardContent>
        </Card>

        {/* Homework/Assignment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Homework / Assignment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {homework.length === 0 ? (
              <div>No homework assigned yet.</div>
            ) : (
              <ul className="space-y-2">
                {homework.map((hw) => (
                  <li key={hw.id} className="flex flex-col gap-1 border-b pb-2">
                    <span className="font-medium">{hw.title}</span>
                    <span className="text-xs text-gray-500">Due: {hw.due_date}</span>
                    <span className="text-xs">{hw.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Notices from Admin */}
        <Card>
          <CardHeader>
            <CardTitle>Notices from Admin</CardTitle>
          </CardHeader>
          <CardContent>
            {notices.length === 0 ? (
              <div>No new notices.</div>
            ) : (
              <ul className="space-y-2">
                {notices.map((notice, idx) => (
                  <li key={idx} className="flex flex-col gap-1 border-b pb-2">
                    <span className="font-medium">{notice.title}</span>
                    <span className="text-xs text-gray-500">{notice.date}</span>
                    <span className="text-xs">{notice.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export function TeacherDashboard() {
  return (
    <ErrorBoundary>
      <TeacherDashboardContent />
    </ErrorBoundary>
  );
} 