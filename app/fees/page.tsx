"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Download, Search, Eye, Receipt, DollarSign, TrendingUp, AlertCircle } from "lucide-react"

interface PaymentHistory {
  date: string
  amount: number
  method: string
  receipt: string
  transaction_id?: string
}

interface Fee {
  id: number
  student_name: string
  student_id: string
  class_name: string
  section: string
  total_amount: number
  paid_amount: number
  tuition_fee: number
  transport_fee: number
  lab_fee: number
  library_fee: number
  sports_fee: number
  other_fees: number
  status: string
  due_date: string
  term: string
  academic_year: string
  payment_history: PaymentHistory[]
}

interface FeeStats {
  totalCollected: number
  totalPending: number
  totalStudents: number
  collectionRate: number
}

export default function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([])
  const [stats, setStats] = useState<FeeStats>({
    totalCollected: 0,
    totalPending: 0,
    totalStudents: 0,
    collectionRate: 0,
  })
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [classFilter, setClassFilter] = useState("")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  useEffect(() => {
    fetchFees()
    fetchFeeStats()
  }, [])

  const fetchFees = async () => {
    try {
      setLoading(true)
      // Fetch both summary and detailed fees list
      const [summaryResponse, feesResponse] = await Promise.all([
        fetch("/api/fees/summary"),
        fetch("/api/fees/list")
      ])

      if (summaryResponse.ok && feesResponse.ok) {
        const summaryData = await summaryResponse.json()
        const feesData = await feesResponse.json()
        setFees(feesData)
      }
    } catch (error) {
      console.error("Error fetching fees:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFeeStats = async () => {
    try {
      const response = await fetch("/api/fees/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching fee stats:", error)
    }
  }

  const generateInvoice = async (feeId: number) => {
    try {
      const response = await fetch(`/api/fees/invoice/${feeId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `invoice_${feeId}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error generating invoice:", error)
    }
  }

  const exportToExcel = async () => {
    try {
      const response = await fetch("/api/fees/export")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "fees_report.xlsx"
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error exporting to Excel:", error)
    }
  }

  const filteredFees = fees.filter((fee) => {
    const matchesSearch =
      fee.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.student_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || fee.status === statusFilter
    const matchesClass = !classFilter || `${fee.class_name} - ${fee.section}` === classFilter

    return matchesSearch && matchesStatus && matchesClass
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:ml-64">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
            <p className="text-gray-600">Track and manage student fee payments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{stats.totalCollected.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This academic year</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₹{stats.totalPending.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Outstanding fees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.collectionRate}%</div>
              <p className="text-xs text-muted-foreground">Payment completion</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <CreditCard className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Enrolled students</p>
            </CardContent>
          </Card>
        </div>

        {/* Fees Table */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Records</CardTitle>
            <CardDescription>View and manage student fee payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFees.map((fee) => (
                <div key={fee.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{fee.student_name}</h3>
                      <p className="text-sm text-gray-500">
                        {fee.student_id} • {fee.class_name} - {fee.section}
                      </p>
                    </div>
                    <Badge className={getStatusColor(fee.status)}>{fee.status}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium">₹{fee.total_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Paid Amount</p>
                      <p className="font-medium">₹{fee.paid_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className="font-medium">{new Date(fee.due_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Term</p>
                      <p className="font-medium">{fee.term}</p>
                    </div>
                  </div>

                  {fee.payment_history.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Payment History</h4>
                      <div className="space-y-2">
                        {fee.payment_history.map((payment, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="font-medium">{new Date(payment.date).toLocaleDateString()}</span>
                              <span className="text-gray-500 ml-2">({payment.method})</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-medium">₹{payment.amount.toLocaleString()}</span>
                              <span className="text-gray-500">Receipt: {payment.receipt}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => generateInvoice(fee.id)}>
                      <Receipt className="h-4 w-4 mr-2" />
                      Generate Invoice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="fee-overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="fee-overview">Fee Overview</TabsTrigger>
            <TabsTrigger value="payment-history">Payment History</TabsTrigger>
            <TabsTrigger value="fee-structure">Fee Structure</TabsTrigger>
          </TabsList>

          <TabsContent value="fee-overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Student Fee Status
                </CardTitle>
                <CardDescription>View and manage fee payments for all students</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by student name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="Class 10 - A">Class 10 - A</SelectItem>
                      <SelectItem value="Class 10 - B">Class 10 - B</SelectItem>
                      <SelectItem value="Class 9 - A">Class 9 - A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fee Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Student</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Class</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Total Amount</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Paid Amount</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Balance</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Due Date</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFees.map((fee) => (
                        <tr key={fee.id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2">
                            <div>
                              <p className="font-medium">{fee.student_name}</p>
                              <p className="text-sm text-gray-600">{fee.student_id}</p>
                            </div>
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            {fee.class_name} - {fee.section}
                          </td>
                          <td className="border border-gray-200 px-4 py-2">₹{fee.total_amount.toLocaleString()}</td>
                          <td className="border border-gray-200 px-4 py-2">₹{fee.paid_amount.toLocaleString()}</td>
                          <td className="border border-gray-200 px-4 py-2">
                            <span
                              className={`font-medium ${
                                fee.total_amount - fee.paid_amount > 0 ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              ₹{(fee.total_amount - fee.paid_amount).toLocaleString()}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <Badge className={getStatusColor(fee.status)}>{fee.status}</Badge>
                          </td>
                          <td className="border border-gray-200 px-4 py-2">{fee.due_date}</td>
                          <td className="border border-gray-200 px-4 py-2">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => generateInvoice(fee.id)}>
                                <Receipt className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment-history">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Track all fee payments and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Date</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Student</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Class</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Amount</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Payment Method</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Receipt Number</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.flatMap(fee => 
                        fee.payment_history.map((payment, index) => (
                          <tr key={`${fee.id}-${index}`} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-2">
                              {new Date(payment.date).toLocaleDateString()}
                            </td>
                            <td className="border border-gray-200 px-4 py-2">
                              <div>
                                <p className="font-medium">{fee.student_name}</p>
                                <p className="text-sm text-gray-600">{fee.student_id}</p>
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-2">
                              {fee.class_name} - {fee.section}
                            </td>
                            <td className="border border-gray-200 px-4 py-2">
                              ₹{payment.amount.toLocaleString()}
                            </td>
                            <td className="border border-gray-200 px-4 py-2">
                              {payment.method}
                            </td>
                            <td className="border border-gray-200 px-4 py-2">
                              {payment.receipt}
                            </td>
                            <td className="border border-gray-200 px-4 py-2">
                              {payment.transaction_id || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fee-structure">
            <Card>
              <CardHeader>
                <CardTitle>Fee Structure</CardTitle>
                <CardDescription>Manage fee categories and amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Standard Fee Components</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span>Tuition Fee</span>
                        <span className="font-medium">₹15,000</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span>Lab Fee</span>
                        <span className="font-medium">₹2,000</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span>Library Fee</span>
                        <span className="font-medium">₹500</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span>Sports Fee</span>
                        <span className="font-medium">₹1,000</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Transport Fee (Optional)</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between p-3 bg-blue-50 rounded">
                        <span>Route 1 - T.Nagar</span>
                        <span className="font-medium">₹1,500/month</span>
                      </div>
                      <div className="flex justify-between p-3 bg-blue-50 rounded">
                        <span>Route 2 - Anna Nagar</span>
                        <span className="font-medium">₹1,800/month</span>
                      </div>
                      <div className="flex justify-between p-3 bg-blue-50 rounded">
                        <span>Route 3 - Adyar</span>
                        <span className="font-medium">₹2,000/month</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
