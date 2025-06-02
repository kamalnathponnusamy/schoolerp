"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Calendar, AlertCircle } from "lucide-react"

interface FloatingStatsSummaryProps {
  totalStudents: number
  attendanceRate: number
  pendingFees: number
  upcomingEvents: number
}

export function FloatingStatsSummary({
  totalStudents,
  attendanceRate,
  pendingFees,
  upcomingEvents,
}: FloatingStatsSummaryProps) {
  return (
    <Card className="fixed bottom-6 right-6 z-30 bg-white/95 backdrop-blur-lg border-0 shadow-2xl max-w-sm hidden lg:block">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Quick Stats</h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">Students</span>
            </div>
            <Badge className="bg-blue-100 text-blue-800">{totalStudents}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Attendance</span>
            </div>
            <Badge className="bg-green-100 text-green-800">{attendanceRate}%</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-gray-600">Pending Fees</span>
            </div>
            <Badge className="bg-red-100 text-red-800">₹{(pendingFees / 1000).toFixed(0)}K</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
