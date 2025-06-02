"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Bus, MapPin, Users, DollarSign, Edit, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

interface TransportRoute {
  id: number
  route_name: string
  route_code: string
  pickup_points: string[]
  driver_name: string
  driver_phone: string
  vehicle_number: string
  capacity: number
  monthly_fee: number
  student_count: number
  total_monthly_revenue: number
}

export default function TransportPage() {
  const [routes, setRoutes] = useState<TransportRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { toast } = useToast()

  const [newRoute, setNewRoute] = useState({
    route_name: "",
    pickup_points: [""],
    driver_name: "",
    driver_phone: "",
    vehicle_number: "",
    capacity: "",
    monthly_fee: "",
  })

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const response = await fetch("/api/transport")
      const data = await response.json()
      setRoutes(data.routes || [])
    } catch (error) {
      console.error("Error fetching transport routes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const routeData = {
        ...newRoute,
        pickup_points: newRoute.pickup_points.filter((point) => point.trim() !== ""),
        capacity: Number.parseInt(newRoute.capacity),
        monthly_fee: Number.parseInt(newRoute.monthly_fee),
      }

      const response = await fetch("/api/transport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routeData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Transport route created successfully",
        })
        setIsAddModalOpen(false)
        resetForm()
        fetchRoutes()
      } else {
        throw new Error("Failed to create route")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create transport route",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setNewRoute({
      route_name: "",
      pickup_points: [""],
      driver_name: "",
      driver_phone: "",
      vehicle_number: "",
      capacity: "",
      monthly_fee: "",
    })
  }

  const addPickupPoint = () => {
    setNewRoute({
      ...newRoute,
      pickup_points: [...newRoute.pickup_points, ""],
    })
  }

  const updatePickupPoint = (index: number, value: string) => {
    const updatedPoints = [...newRoute.pickup_points]
    updatedPoints[index] = value
    setNewRoute({
      ...newRoute,
      pickup_points: updatedPoints,
    })
  }

  const removePickupPoint = (index: number) => {
    if (newRoute.pickup_points.length > 1) {
      const updatedPoints = newRoute.pickup_points.filter((_, i) => i !== index)
      setNewRoute({
        ...newRoute,
        pickup_points: updatedPoints,
      })
    }
  }

  const totalRoutes = routes.length
  const totalStudents = routes.reduce((sum, route) => sum + route.student_count, 0)
  const totalRevenue = routes.reduce((sum, route) => sum + route.total_monthly_revenue, 0)
  const totalCapacity = routes.reduce((sum, route) => sum + route.capacity, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading transport routes...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transport Management</h1>
          <p className="text-muted-foreground">Manage school transport routes and assignments</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Transport Route</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRoute} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="route_name">Route Name</Label>
                  <Input
                    id="route_name"
                    value={newRoute.route_name}
                    onChange={(e) => setNewRoute({ ...newRoute, route_name: e.target.value })}
                    placeholder="e.g., T.Nagar Route"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="monthly_fee">Monthly Fee (₹)</Label>
                  <Input
                    id="monthly_fee"
                    type="number"
                    value={newRoute.monthly_fee}
                    onChange={(e) => setNewRoute({ ...newRoute, monthly_fee: e.target.value })}
                    placeholder="1500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="driver_name">Driver Name</Label>
                  <Input
                    id="driver_name"
                    value={newRoute.driver_name}
                    onChange={(e) => setNewRoute({ ...newRoute, driver_name: e.target.value })}
                    placeholder="Driver Name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="driver_phone">Driver Phone</Label>
                  <Input
                    id="driver_phone"
                    value={newRoute.driver_phone}
                    onChange={(e) => setNewRoute({ ...newRoute, driver_phone: e.target.value })}
                    placeholder="+91-9876543210"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle_number">Vehicle Number</Label>
                  <Input
                    id="vehicle_number"
                    value={newRoute.vehicle_number}
                    onChange={(e) => setNewRoute({ ...newRoute, vehicle_number: e.target.value })}
                    placeholder="TN09AB1234"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newRoute.capacity}
                    onChange={(e) => setNewRoute({ ...newRoute, capacity: e.target.value })}
                    placeholder="50"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Pickup Points</Label>
                {newRoute.pickup_points.map((point, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={point}
                      onChange={(e) => updatePickupPoint(index, e.target.value)}
                      placeholder={`Pickup point ${index + 1}`}
                      required
                    />
                    {newRoute.pickup_points.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removePickupPoint(index)}>
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addPickupPoint} className="mt-2">
                  Add Pickup Point
                </Button>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Route</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Routes</p>
                <p className="text-2xl font-bold">{totalRoutes}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bus className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Students Using Transport</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Capacity Utilization</p>
                <p className="text-2xl font-bold">
                  {totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0}%
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm font-semibold">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Routes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transport Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Pickup Points</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Monthly Fee</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{route.route_name}</div>
                        <div className="text-sm text-muted-foreground">{route.route_code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{route.driver_name}</div>
                        <div className="text-sm text-muted-foreground">{route.driver_phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{route.vehicle_number}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{route.pickup_points?.length || 0} stops</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{route.student_count}</span>
                        <span className="text-sm text-muted-foreground">/ {route.capacity}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((route.student_count / route.capacity) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </TableCell>
                    <TableCell>₹{route.monthly_fee.toLocaleString()}</TableCell>
                    <TableCell>₹{route.total_monthly_revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Live Map Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Route Map Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.886539092!2d80.06892!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265ea4f7d3361%3A0x6e61a70b6863d433!2sChennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
            ></iframe>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
