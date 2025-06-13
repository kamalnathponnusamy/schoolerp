"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import {
  Download,
  CalendarIcon,
  TrendingUp,
  Users,
  CreditCard,
  Bus,
  Package,
  BookOpen,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react"
import { format as dateFormat } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface ReportData {
  attendance: any[]
  fees: any[]
  academic: any[]
  transport: any[]
  inventory: any[]
  demographics: any[]
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    attendance: [],
    fees: [],
    academic: [],
    transport: [],
    inventory: [],
    demographics: [],
  })
  const [loading, setLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [selectedClass, setSelectedClass] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      // Generate sample data for demonstration
      setReportData({
        attendance: Array.from({ length: 30 }, (_, i) => ({
          id: i + 1,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          class: `Class ${Math.floor(Math.random() * 12) + 1}`,
          present: Math.floor(Math.random() * 40) + 20,
          absent: Math.floor(Math.random() * 10) + 1,
          percentage: Math.floor(Math.random() * 20) + 80,
        })),
        fees: Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          student: `Student ${i + 1}`,
          amount: Math.floor(Math.random() * 50000) + 10000,
          status: Math.random() > 0.3 ? "paid" : "pending",
        })),
        academic: Array.from({ length: 25 }, (_, i) => ({
          id: i + 1,
          student: `Student ${i + 1}`,
          subject: ["Math", "Science", "English", "History"][Math.floor(Math.random() * 4)],
          marks: Math.floor(Math.random() * 40) + 60,
        })),
        transport: Array.from({ length: 15 }, (_, i) => ({
          id: i + 1,
          route: `Route ${i + 1}`,
          students: Math.floor(Math.random() * 30) + 10,
          revenue: Math.floor(Math.random() * 20000) + 5000,
        })),
        inventory: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          item: `Item ${i + 1}`,
          quantity: Math.floor(Math.random() * 100) + 10,
          value: Math.floor(Math.random() * 5000) + 1000,
        })),
        demographics: Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          class: `Class ${i + 1}`,
          boys: Math.floor(Math.random() * 25) + 15,
          girls: Math.floor(Math.random() * 25) + 15,
        })),
      })
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setLoading(false)
    }
  }

  // <--- FIXED: renamed parameter from format to reportFormat and imported dateFormat
  const generateReport = async (type: string, reportFormat: "pdf" | "excel") => {
    try {
      const params = new URLSearchParams({
        type,
        format: reportFormat,
        ...(dateFrom && { dateFrom: dateFormat(dateFrom, "yyyy-MM-dd") }),
        ...(dateTo && { dateTo: dateFormat(dateTo, "yyyy-MM-dd") }),
        ...(selectedClass && { class: selectedClass }),
      })

      // Generate actual report content
      const reportContent = generateReportContent(type, reportFormat)

      const blob = new Blob([reportContent], {
        type:
          reportFormat === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}_report_${new Date().toISOString().split("T")[0]}.${reportFormat === "pdf" ? "pdf" : "xlsx"}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating report:", error)
    }
  }

  const generateReportContent = (type: string, reportFormat: string) => {
    const data = reportData[type as keyof ReportData] || []
    let content = `${type.toUpperCase()} REPORT\n`
    content += `Generated on: ${new Date().toLocaleDateString()}\n`
    content += `Format: ${reportFormat}\n\n`

    if (data.length > 0) {
      content += "DATA:\n"
      data.forEach((item, index) => {
        content += `${index + 1}. ${JSON.stringify(item)}\n`
      })
    } else {
      content += "No data available for this report.\n"
    }

    return content
  }

  const ReportCard = ({ title, description, icon: Icon, type, data }: any) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-2xl font-bold">{data.length} Records</div>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" onClick={() => generateReport(type, "pdf")} className="w-full" disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => generateReport(type, "excel")}
              className="w-full"
              disabled={loading}
            >
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* <div className="lg:pl-64"> */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
              <p className="text-muted-foreground">Generate comprehensive reports for school management</p>
            </div>
            <Button onClick={fetchReportData} disabled={loading} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh Data"}
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Report Filters</CardTitle>
              <CardDescription>Customize your reports with date ranges and class filters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? dateFormat(dateFrom, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? dateFormat(dateTo, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="Class 10 - A">Class 10 - A</SelectItem>
                      <SelectItem value="Class 10 - B">Class 10 - B</SelectItem>
                      <SelectItem value="Class 9 - A">Class 9 - A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ReportCard
              title="Attendance Report"
              description="Daily, weekly, and monthly attendance analytics"
              icon={TrendingUp}
              type="attendance"
              data={reportData.attendance}
            />
            <ReportCard
              title="Fee Collection Report"
              description="Payment status, pending fees, and collection analytics"
              icon={CreditCard}
              type="fees"
              data={reportData.fees}
            />
            <ReportCard
              title="Academic Performance"
              description="Exam results, grades, and subject-wise performance"
              icon={BookOpen}
              type="academic"
              data={reportData.academic}
            />
            <ReportCard
              title="Transport Usage"
              description="Route-wise student count and transport billing"
              icon={Bus}
              type="transport"
              data={reportData.transport}
            />
            <ReportCard
              title="Student Demographics"
              description="Class-wise distribution, gender, and admission trends"
              icon={Users}
              type="demographics"
              data={reportData.demographics}
            />
            <ReportCard
              title="Inventory Report"
              description="Stock levels, usage history, and low stock alerts"
              icon={Package}
              type="inventory"
              data={reportData.inventory}
            />
          </div>

          {/* Detailed Reports */}
          <Tabs defaultValue="attendance" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
            </TabsList>

            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Attendance Analytics
                      </CardTitle>
                      <CardDescription>Detailed attendance statistics and trends</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button size="sm" onClick={() => generateReport("attendance", "pdf")}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">92%</div>
                        <div className="text-sm text-muted-foreground">Average Attendance</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">1,250</div>
                        <div className="text-sm text-muted-foreground">Total Students</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">45</div>
                        <div className="text-sm text-muted-foreground">Absent Today</div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Present</TableHead>
                          <TableHead>Absent</TableHead>
                          <TableHead>Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.attendance.slice(0, 10).map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{record.class}</Badge>
                            </TableCell>
                            <TableCell>{record.present}</TableCell>
                            <TableCell>{record.absent}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  record.percentage >= 90
                                    ? "default"
                                    : record.percentage >= 80
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {record.percentage}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fees">
              <Card>
                <CardHeader>
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Fee Collection Analytics
                      </CardTitle>
                      <CardDescription>Payment trends and outstanding amounts</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button size="sm" onClick={() => generateReport("fees", "pdf")}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">₹2.5M</div>
                        <div className="text-sm text-muted-foreground">Total Collected</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">₹125K</div>
                        <div className="text-sm text-muted-foreground">Pending Amount</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">95%</div>
                        <div className="text-sm text-muted-foreground">Collection Rate</div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.fees.slice(0, 10).map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.student}</TableCell>
                            <TableCell>₹{record.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={record.status === "paid" ? "default" : "destructive"}>
                                {record.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academic">
              <Card>
                <CardHeader>
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Academic Performance Analytics
                      </CardTitle>
                      <CardDescription>Exam results and subject-wise performance</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button size="sm" onClick={() => generateReport("academic", "pdf")}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">85%</div>
                        <div className="text-sm text-muted-foreground">Average Score</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">95%</div>
                        <div className="text-sm text-muted-foreground">Pass Rate</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">15</div>
                        <div className="text-sm text-muted-foreground">Top Performers</div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Marks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.academic.slice(0, 10).map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.student}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{record.subject}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  record.marks >= 90 ? "default" : record.marks >= 75 ? "secondary" : "destructive"
                                }
                              >
                                {record.marks}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      {/* </div> */}
    </div>
  )
}
