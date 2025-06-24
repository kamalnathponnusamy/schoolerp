"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExportButton } from '@/components/ui/export-button'
import { ExportGroup } from '@/components/ui/export-group'
import { useExport } from '@/hooks/useExport'
import { formatDataForExport, generateFilename } from '@/utils/exportUtils'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CreditCard, 
  BookOpen, 
  Calendar,
  RefreshCw
} from 'lucide-react'

// Mock data interfaces
interface AttendanceData {
  date: string
  class: string
  present: number
  absent: number
  total: number
  percentage: number
}

interface FeeData {
  studentId: string
  studentName: string
  class: string
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  status: string
  dueDate: string
}

interface AcademicData {
  studentName: string
  class: string
  subject: string
  examType: string
  marksObtained: number
  totalMarks: number
  percentage: number
  grade: string
}

// Mock data generators
const generateAttendanceData = (): AttendanceData[] => {
  const classes = ['Class 10-A', 'Class 10-B', 'Class 9-A', 'Class 9-B', 'Class 8-A']
  const data: AttendanceData[] = []
  
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    classes.forEach(className => {
      const present = Math.floor(Math.random() * 15) + 25
      const absent = Math.floor(Math.random() * 8) + 2
      const total = present + absent
      const percentage = Math.round((present / total) * 100)
      
      data.push({
        date: date.toISOString().split('T')[0],
        class: className,
        present,
        absent,
        total,
        percentage
      })
    })
  }
  
  return data.slice(0, 50) // Limit to 50 records for demo
}

const generateFeeData = (): FeeData[] => {
  const classes = ['Class 10-A', 'Class 10-B', 'Class 9-A', 'Class 9-B']
  const statuses = ['Paid', 'Pending', 'Overdue']
  const data: FeeData[] = []
  
  for (let i = 1; i <= 40; i++) {
    const totalAmount = Math.floor(Math.random() * 20000) + 15000
    const paidAmount = Math.floor(Math.random() * totalAmount)
    const pendingAmount = totalAmount - paidAmount
    const status = pendingAmount === 0 ? 'Paid' : statuses[Math.floor(Math.random() * statuses.length)]
    
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 60))
    
    data.push({
      studentId: `STU${i.toString().padStart(4, '0')}`,
      studentName: `Student ${i}`,
      class: classes[Math.floor(Math.random() * classes.length)],
      totalAmount,
      paidAmount,
      pendingAmount,
      status,
      dueDate: dueDate.toISOString().split('T')[0]
    })
  }
  
  return data
}

const generateAcademicData = (): AcademicData[] => {
  const classes = ['Class 10-A', 'Class 10-B', 'Class 9-A']
  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography']
  const examTypes = ['Unit Test', 'Quarterly', 'Half Yearly', 'Annual']
  const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
  const data: AcademicData[] = []
  
  for (let i = 1; i <= 30; i++) {
    const totalMarks = 100
    const marksObtained = Math.floor(Math.random() * 95) + 5
    const percentage = Math.round((marksObtained / totalMarks) * 100)
    
    let grade = 'F'
    if (percentage >= 90) grade = 'A+'
    else if (percentage >= 80) grade = 'A'
    else if (percentage >= 70) grade = 'B+'
    else if (percentage >= 60) grade = 'B'
    else if (percentage >= 50) grade = 'C+'
    else if (percentage >= 40) grade = 'C'
    else if (percentage >= 35) grade = 'D'
    
    data.push({
      studentName: `Student ${i}`,
      class: classes[Math.floor(Math.random() * classes.length)],
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      examType: examTypes[Math.floor(Math.random() * examTypes.length)],
      marksObtained,
      totalMarks,
      percentage,
      grade
    })
  }
  
  return data
}

export const ReportsExample: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Generate mock data
  const attendanceData = useMemo(() => generateAttendanceData(), [refreshKey])
  const feeData = useMemo(() => generateFeeData(), [refreshKey])
  const academicData = useMemo(() => generateAcademicData(), [refreshKey])
  
  // Use export hook for advanced functionality
  const { isExporting, exportingFormat, exportToPdf, exportToExcel } = useExport({
    onSuccess: (format) => {
      console.log(`Successfully exported ${format} file`)
    },
    onError: (error, format) => {
      console.error(`Failed to export ${format}:`, error)
    }
  })

  // Format data for export with better column names
  const formattedAttendanceData = formatDataForExport(attendanceData, {
    date: 'Date',
    class: 'Class',
    present: 'Present',
    absent: 'Absent',
    total: 'Total Students',
    percentage: 'Attendance %'
  })

  const formattedFeeData = formatDataForExport(feeData, {
    studentId: 'Student ID',
    studentName: 'Student Name',
    class: 'Class',
    totalAmount: 'Total Amount (₹)',
    paidAmount: 'Paid Amount (₹)',
    pendingAmount: 'Pending Amount (₹)',
    status: 'Status',
    dueDate: 'Due Date'
  })

  const formattedAcademicData = formatDataForExport(academicData, {
    studentName: 'Student Name',
    class: 'Class',
    subject: 'Subject',
    examType: 'Exam Type',
    marksObtained: 'Marks Obtained',
    totalMarks: 'Total Marks',
    percentage: 'Percentage',
    grade: 'Grade'
  })

  const handleRefreshData = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Advanced export with custom options
  const handleAdvancedExport = async (data: any[], title: string, format: 'pdf' | 'excel') => {
    const options = {
      title: `${title} - School Management Report`,
      subtitle: `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      filename: generateFilename(title.toLowerCase().replace(/\s+/g, '_'), format === 'pdf' ? 'pdf' : 'xlsx'),
      orientation: 'landscape' as const,
      pageSize: 'a4' as const
    }

    if (format === 'pdf') {
      await exportToPdf(data, options)
    } else {
      await exportToExcel(data, options)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground">Export comprehensive reports for school management</p>
          </div>
          <Button onClick={handleRefreshData} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Attendance Report */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Attendance Report</CardTitle>
                    <CardDescription>Daily attendance analytics</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Records:</span>
                  <div className="font-semibold">{attendanceData.length}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Attendance:</span>
                  <div className="font-semibold">
                    {Math.round(attendanceData.reduce((sum, item) => sum + item.percentage, 0) / attendanceData.length)}%
                  </div>
                </div>
              </div>
              
              {/* Simple Export Buttons */}
              <div className="flex gap-2">
                <ExportButton
                  data={formattedAttendanceData}
                  format="pdf"
                  title="Attendance Report"
                  filename="attendance_report"
                  orientation="landscape"
                  className="flex-1"
                />
                <ExportButton
                  data={formattedAttendanceData}
                  format="excel"
                  title="Attendance Report"
                  filename="attendance_report"
                  className="flex-1"
                />
              </div>

              {/* Export Group Alternative */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quick Export:</span>
                  <ExportGroup
                    data={formattedAttendanceData}
                    title="Attendance Report"
                    filename="attendance_quick_export"
                    orientation="landscape"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Collection Report */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Fee Collection</CardTitle>
                    <CardDescription>Payment status and analytics</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Students:</span>
                  <div className="font-semibold">{feeData.length}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Collection Rate:</span>
                  <div className="font-semibold">
                    {Math.round((feeData.filter(f => f.status === 'Paid').length / feeData.length) * 100)}%
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => handleAdvancedExport(formattedFeeData, 'Fee Collection Report', 'pdf')}
                  disabled={isExporting && exportingFormat === 'pdf'}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {isExporting && exportingFormat === 'pdf' ? 'Exporting...' : 'Advanced PDF'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => handleAdvancedExport(formattedFeeData, 'Fee Collection Report', 'excel')}
                  disabled={isExporting && exportingFormat === 'excel'}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {isExporting && exportingFormat === 'excel' ? 'Exporting...' : 'Advanced Excel'}
                </Button>
              </div>

              <ExportGroup
                data={formattedFeeData}
                title="Fee Collection Report"
                filename="fee_collection_report"
                className="justify-center"
              />
            </CardContent>
          </Card>

          {/* Academic Performance Report */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Academic Performance</CardTitle>
                    <CardDescription>Exam results and grades</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Results:</span>
                  <div className="font-semibold">{academicData.length}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Score:</span>
                  <div className="font-semibold">
                    {Math.round(academicData.reduce((sum, item) => sum + item.percentage, 0) / academicData.length)}%
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <ExportButton
                    data={formattedAcademicData}
                    format="pdf"
                    title="Academic Performance Report"
                    filename="academic_performance"
                    variant="outline"
                    className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                  />
                  <ExportButton
                    data={formattedAcademicData}
                    format="excel"
                    title="Academic Performance Report"
                    filename="academic_performance"
                    variant="outline"
                    className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Statistics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Export Summary
            </CardTitle>
            <CardDescription>Overview of available data for export</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{attendanceData.length}</div>
                <div className="text-sm text-blue-700">Attendance Records</div>
                <Badge variant="secondary" className="mt-2">Ready for Export</Badge>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{feeData.length}</div>
                <div className="text-sm text-green-700">Fee Records</div>
                <Badge variant="secondary" className="mt-2">Ready for Export</Badge>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{academicData.length}</div>
                <div className="text-sm text-purple-700">Academic Records</div>
                <Badge variant="secondary" className="mt-2">Ready for Export</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ReportsExample