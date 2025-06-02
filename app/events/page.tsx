"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Plus, Edit, Trash2, Eye, CalendarIcon } from "lucide-react"

interface Event {
  id: number
  event_name: string
  description: string
  event_date: string
  event_time: string
  created_by_name: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    event_name: "",
    description: "",
    event_date: "",
    event_time: "",
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/events")
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert("Event created successfully!")
        setFormData({
          event_name: "",
          description: "",
          event_date: "",
          event_time: "",
        })
        fetchEvents()
      } else {
        alert("Failed to create event")
      }
    } catch (error) {
      console.error("Error creating event:", error)
      alert("Error creating event")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const deleteEvent = async (eventId: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        const response = await fetch(`/api/events/${eventId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          alert("Event deleted successfully!")
          fetchEvents()
        } else {
          alert("Failed to delete event")
        }
      } catch (error) {
        console.error("Error deleting event:", error)
        alert("Error deleting event")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:ml-64">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
            <p className="text-gray-600">Create and manage school events</p>
          </div>
        </div>

        <Tabs defaultValue="create-event" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="create-event">Create Event</TabsTrigger>
            <TabsTrigger value="view-events">View Events</TabsTrigger>
          </TabsList>

          <TabsContent value="create-event">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Event
                </CardTitle>
                <CardDescription>Add a new school event</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event_name">Event Name *</Label>
                      <Input
                        id="event_name"
                        value={formData.event_name}
                        onChange={(e) => handleInputChange("event_name", e.target.value)}
                        placeholder="Enter event name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event_date">Event Date *</Label>
                      <Input
                        id="event_date"
                        type="date"
                        value={formData.event_date}
                        onChange={(e) => handleInputChange("event_date", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event_time">Event Time</Label>
                      <Input
                        id="event_time"
                        type="time"
                        value={formData.event_time}
                        onChange={(e) => handleInputChange("event_time", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter event description"
                      rows={4}
                    />
                  </div>
                  <Button type="submit" disabled={saving} className="w-full">
                    {saving ? "Creating..." : "Create Event"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="view-events">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  All Events ({events.length})
                </CardTitle>
                <CardDescription>View and manage all school events</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading events...</div>
                ) : events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{event.event_name}</h3>
                            <p className="text-gray-600 mt-1">{event.description}</p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                {event.event_date}
                              </span>
                              {event.event_time && <span>Time: {event.event_time}</span>}
                              <span>Created by: {event.created_by_name}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteEvent(event.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No events found</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
