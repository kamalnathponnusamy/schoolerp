'use client';

import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, BookOpen, Calendar, CheckCircle, XCircle, Download, Upload, Eye, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from './ErrorBoundary';

interface Notification {
  id: number;
  type: 'attendance' | 'homework';
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface Homework {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  attachments: string[];
  submitted: boolean;
  submittedFiles?: File[];
}

interface Attendance {
  date: Date;
  status: 'present' | 'absent';
}

interface FilePreview {
  file: File;
  preview: string;
}

const DashboardCard = memo(({ title, icon, tooltip, children }: { 
  title: string; 
  icon: React.ReactNode; 
  tooltip: string;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  </motion.div>
));

DashboardCard.displayName = 'DashboardCard';

const NotificationItem = memo(({ notification, onMarkAsRead }: {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className={`p-4 border rounded-lg ${!notification.read ? 'bg-blue-50' : ''} 
      focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2`}
    role="article"
    aria-label={`${notification.type} notification`}
    tabIndex={0}
  >
    <div className="flex items-start justify-between">
      <div>
        <Badge
          variant={notification.type === 'homework' ? 'default' : 'secondary'}
          className="mb-2"
        >
          {notification.type}
        </Badge>
        <p className="text-sm">{notification.message}</p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(notification.timestamp).toLocaleString()}
        </p>
      </div>
      {!notification.read && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMarkAsRead(notification.id)}
          aria-label="Mark notification as read"
          className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Mark as read
        </Button>
      )}
    </div>
  </motion.div>
));

NotificationItem.displayName = 'NotificationItem';

const HomeworkItem = memo(({ homework, onDownload, onSubmit }: {
  homework: Homework;
  onDownload: (id: number, url: string) => void;
  onSubmit: (homework: Homework) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200
      focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
  >
    <div className="flex items-start justify-between">
      <div>
        <h3 className="font-medium">{homework.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{homework.description}</p>
        <p className="text-xs text-gray-500 mt-2">
          Due: {new Date(homework.dueDate).toLocaleDateString()}
        </p>
        {homework.attachments.length > 0 && (
          <div className="mt-2 space-x-2">
            {homework.attachments.map((attachment, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onDownload(homework.id, attachment)}
                aria-label={`Download attachment ${index + 1}`}
                className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Download className="w-4 h-4 mr-2" />
                Attachment {index + 1}
              </Button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {homework.submitted ? (
          <Badge variant="default">Submitted</Badge>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => onSubmit(homework)}
            aria-label="Submit homework"
            className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit
          </Button>
        )}
      </div>
    </div>
  </motion.div>
));

HomeworkItem.displayName = 'HomeworkItem';

const AttendanceRecord = memo(({ record }: { record: Attendance }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center justify-between p-4 border rounded-lg
      hover:shadow-md transition-shadow duration-200
      focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
    tabIndex={0}
  >
    <div>
      <p className="font-medium">
        {new Date(record.date).toLocaleDateString()}
      </p>
    </div>
    <Badge
      variant={record.status === 'present' ? 'default' : 'destructive'}
      className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {record.status === 'present' ? (
        <CheckCircle className="w-4 h-4 mr-2" />
      ) : (
        <XCircle className="w-4 h-4 mr-2" />
      )}
      {record.status}
    </Badge>
  </motion.div>
));

AttendanceRecord.displayName = 'AttendanceRecord';

const HomeworkSubmissionModal = memo(({ homework, onClose, onSubmit }: {
  homework: Homework;
  onClose: () => void;
  onSubmit: (files: File[]) => void;
}) => {
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setFilePreviews([...filePreviews, ...newPreviews]);
  }, [filePreviews]);

  const handleRemoveFile = useCallback((index: number) => {
    URL.revokeObjectURL(filePreviews[index].preview);
    setFilePreviews(filePreviews.filter((_, i) => i !== index));
  }, [filePreviews]);

  useEffect(() => {
    return () => {
      filePreviews.forEach(preview => URL.revokeObjectURL(preview.preview));
    };
  }, [filePreviews]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-2xl w-full"
      >
        <h2 className="text-xl font-bold mb-4">Submit Homework: {homework.title}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Upload Files</label>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              ref={fileInputRef}
              className="hidden"
              aria-label="Select files to upload"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              Select Files
            </Button>
          </div>
          <AnimatePresence>
            {filePreviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium">Selected Files</label>
                <div className="space-y-2">
                  {filePreviews.map((preview, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        <span className="text-sm">{preview.file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                        aria-label={`Remove file ${preview.file.name}`}
                        className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        ×
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onSubmit(filePreviews.map(p => p.file))}
              disabled={filePreviews.length === 0}
              className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Submit
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

HomeworkSubmissionModal.displayName = 'HomeworkSubmissionModal';

export function StudentDashboard() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      try {
        // Fetch notifications
        const notificationsResponse = await fetch('/api/notifications');
        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json();
          setNotifications(notificationsData);
          checkCriticalNotifications(notificationsData);
        }

        // Fetch homework
        const homeworkResponse = await fetch('/api/homework');
        if (homeworkResponse.ok) {
          const homeworkData = await homeworkResponse.json();
          setHomework(homeworkData);
        }

        // Fetch attendance
        const attendanceResponse = await fetch('/api/attendance/student');
        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json();
          setAttendance(attendanceData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, [mounted]);

  const checkCriticalNotifications = (notifications: Notification[]) => {
    const criticalNotifications = notifications.filter(
      n => n.priority === 'high' && !n.read
    );

    if (criticalNotifications.length > 0 && Notification.permission === 'granted') {
      criticalNotifications.forEach(notification => {
        new Notification('Critical Notification', {
          body: notification.message,
          icon: '/logo.png'
        });
      });
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications(notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        ));
        toast.success('Notification marked as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleDownloadAttachment = async (homeworkId: number, attachmentUrl: string) => {
    try {
      const response = await fetch(`/api/homework/${homeworkId}/attachments/${attachmentUrl}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachmentUrl.split('/').pop() || 'attachment';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Attachment downloaded successfully');
      }
    } catch (error) {
      console.error('Error downloading attachment:', error);
      toast.error('Failed to download attachment');
    }
  };

  const handleSubmitHomework = async (files: File[]) => {
    if (!selectedHomework) return;

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/homework/${selectedHomework.id}/submit`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setHomework(homework.map(hw =>
          hw.id === selectedHomework.id
            ? { ...hw, submitted: true, submittedFiles: files }
            : hw
        ));
        setSelectedHomework(null);
        toast.success('Homework submitted successfully');
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
      toast.error('Failed to submit homework');
    }
  };

  const getAttendanceData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => {
      const record = attendance.find(a => 
        new Date(a.date).toISOString().split('T')[0] === date
      );
      return {
        date,
        present: record?.status === 'present' ? 1 : 0,
        absent: record?.status === 'absent' ? 1 : 0
      };
    });
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6" role="main" aria-label="Student Dashboard">
        <AnimatePresence mode="wait">
          {showGuide && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-md"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">Welcome to your Dashboard!</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGuide(false)}
                  className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  ×
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Here's a quick guide to help you navigate:
              </p>
              <ul className="text-sm text-gray-600 list-disc pl-4 space-y-1">
                <li>Check notifications for important updates</li>
                <li>View and submit homework assignments</li>
                <li>Track your attendance record</li>
                <li>Download course materials</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8"
        >
          Student Dashboard
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            title="Pending Homework"
            icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
            tooltip="Number of assignments that need to be completed"
          >
            <div className="text-2xl font-bold">
              {homework.filter(hw => !hw.submitted).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Assignments to complete
            </p>
          </DashboardCard>

          <DashboardCard
            title="Attendance Rate"
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
            tooltip="Your attendance percentage for the current term"
          >
            <div className="text-2xl font-bold">
              {Math.round(
                (attendance.filter(a => a.status === 'present').length / (attendance.length || 1)) * 100
              )}%
            </div>
            <p className="text-xs text-muted-foreground">
              Current attendance rate
            </p>
          </DashboardCard>

          <DashboardCard
            title="Notifications"
            icon={<Bell className="h-4 w-4 text-muted-foreground" />}
            tooltip="Important updates and announcements"
          >
            <div className="text-2xl font-bold">
              {notifications.filter(n => !n.read).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Unread notifications
            </p>
          </DashboardCard>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="homework">Homework</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <AnimatePresence mode="wait">
                    {notifications.length === 0 ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-gray-500 py-4"
                      >
                        No notifications
                      </motion.p>
                    ) : (
                      <div className="space-y-4">
                        {notifications.map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkAsRead={handleMarkAsRead}
                          />
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="homework">
            <Card>
              <CardHeader>
                <CardTitle>Homework</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <AnimatePresence mode="wait">
                    {homework.length === 0 ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-gray-500 py-4"
                      >
                        No homework assigned
                      </motion.p>
                    ) : (
                      <div className="space-y-4">
                        {homework.map((hw) => (
                          <HomeworkItem
                            key={hw.id}
                            homework={hw}
                            onDownload={handleDownloadAttachment}
                            onSubmit={setSelectedHomework}
                          />
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Record</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getAttendanceData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="present" fill="#4CAF50" name="Present" />
                      <Bar dataKey="absent" fill="#F44336" name="Absent" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <ScrollArea className="h-[200px]">
                  <AnimatePresence mode="wait">
                    {attendance.length === 0 ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-gray-500 py-4"
                      >
                        No attendance records
                      </motion.p>
                    ) : (
                      <div className="space-y-4">
                        {attendance.map((record, index) => (
                          <AttendanceRecord key={index} record={record} />
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AnimatePresence mode="wait">
          {selectedHomework && (
            <HomeworkSubmissionModal
              homework={selectedHomework}
              onClose={() => setSelectedHomework(null)}
              onSubmit={handleSubmitHomework}
            />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
} 