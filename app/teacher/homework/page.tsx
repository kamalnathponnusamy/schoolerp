"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, Camera, FileText, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface Class {
  id: number;
  class_name: string;
  section: string;
  student_count: number;
}

interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
}

interface Homework {
  id: number;
  title: string;
  description: string;
  subject_id: number;
  subject_name: string;
  due_date: Date;
  status: "pending" | "completed";
  assigned_by: string;
  attachments?: string[];
}

export default function HomeworkPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHomeworkForm, setShowHomeworkForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadType, setUploadType] = useState<"file" | "camera">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const [newHomework, setNewHomework] = useState({
    title: "",
    description: "",
    subject_id: "",
    due_date: new Date(),
    class_id: "",
  });

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/classes/by-teacher');
        if (!response.ok) throw new Error('Failed to fetch classes');
        const data = await response.json();
        setClasses(data.classes);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError('Failed to load classes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Fetch subjects when class is selected
  useEffect(() => {
    if (!selectedClass) return;

    const fetchSubjects = async () => {
      try {
        const response = await fetch(`/api/subjects/by-class/${selectedClass}`);
        if (!response.ok) throw new Error('Failed to fetch subjects');
        const data = await response.json();
        setSubjects(data.subjects);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setError('Failed to load subjects');
      }
    };

    fetchSubjects();
  }, [selectedClass]);

  // Fetch homework when class is selected
  useEffect(() => {
    if (!selectedClass) return;

    const fetchHomework = async () => {
      try {
        const response = await fetch(`/api/homework/by-class/${selectedClass}`);
        if (!response.ok) throw new Error('Failed to fetch homework');
        const data = await response.json();
        setHomework(data.homework);
      } catch (error) {
        console.error('Error fetching homework:', error);
        setError('Failed to load homework');
      }
    };

    fetchHomework();
  }, [selectedClass]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Implement camera capture logic here
      // You'll need to create a video element and canvas to capture the image
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to capture images",
        variant: "destructive",
      });
    }
  };

  const handleHomeworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) {
      toast({
        title: "No class selected",
        description: "Please select a class first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', newHomework.title);
      formData.append('description', newHomework.description);
      formData.append('subject_id', newHomework.subject_id);
      formData.append('class_id', selectedClass);
      formData.append('due_date', newHomework.due_date.toISOString());
      if (selectedFile) {
        formData.append('attachment', selectedFile);
      }

      const response = await fetch('/api/homework', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create homework');

      toast({
        title: "Homework assigned",
        description: "The homework has been successfully assigned",
      });

      // Reset form
      setNewHomework({
        title: "",
        description: "",
        subject_id: "",
        due_date: new Date(),
        class_id: "",
      });
      setSelectedFile(null);
      setShowHomeworkForm(false);

      // Refresh homework list
      const updatedResponse = await fetch(`/api/homework/by-class/${selectedClass}`);
      const updatedData = await updatedResponse.json();
      setHomework(updatedData.homework);
    } catch (error) {
      console.error('Error creating homework:', error);
      toast({
        title: "Error",
        description: "Failed to assign homework. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Homework Management</h1>

      <div className="grid gap-6">
        {/* Class Selection */}
        <div className="space-y-2">
          <Label>Select Class</Label>
          <Select
            value={selectedClass}
            onValueChange={setSelectedClass}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                isLoading ? "Loading classes..." : "Select a class"
              } />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.class_name} - {cls.section} ({cls.student_count} students)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedClass && (
          <>
            {/* Homework Form */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Assign New Homework</CardTitle>
                  <Button
                    onClick={() => setShowHomeworkForm(!showHomeworkForm)}
                    variant="outline"
                  >
                    {showHomeworkForm ? "Cancel" : "New Homework"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showHomeworkForm && (
                  <form onSubmit={handleHomeworkSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={newHomework.title}
                        onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                        placeholder="Enter homework title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newHomework.description}
                        onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })}
                        placeholder="Enter homework description"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Select
                        value={newHomework.subject_id}
                        onValueChange={(value) => setNewHomework({ ...newHomework, subject_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id.toString()}>
                              {subject.subject_name} ({subject.subject_code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Calendar
                        mode="single"
                        selected={newHomework.due_date}
                        onSelect={(date) => date && setNewHomework({ ...newHomework, due_date: date })}
                        className="rounded-md border"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Attachment</Label>
                      <Tabs value={uploadType} onValueChange={(value) => setUploadType(value as "file" | "camera")}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="file">
                            <FileText className="w-4 h-4 mr-2" />
                            Upload File
                          </TabsTrigger>
                          <TabsTrigger value="camera">
                            <Camera className="w-4 h-4 mr-2" />
                            Take Photo
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="file" className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={handleFileChange}
                              className="flex-1"
                            />
                            {selectedFile && (
                              <Badge variant="secondary">
                                {selectedFile.name}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Supported formats: PDF, DOC, JPG, PNG (max 5MB)
                          </p>
                        </TabsContent>
                        <TabsContent value="camera" className="space-y-2">
                          <Button
                            type="button"
                            onClick={handleCameraCapture}
                            className="w-full"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Open Camera
                          </Button>
                        </TabsContent>
                      </Tabs>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Assign Homework
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Homework List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {homework.map((item) => (
                <Card key={item.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm text-gray-500">
                        {item.subject_name} • Due: {format(new Date(item.due_date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge
                      variant={item.status === "completed" ? "default" : "secondary"}
                      className={item.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  {item.attachments && item.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.attachments.map((attachment, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {attachment.split('/').pop()}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Assigned by {item.assigned_by}</span>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 