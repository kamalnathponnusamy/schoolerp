"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { School, Users, Bus, Database, Save, Upload, Trash2, Edit, Plus } from "lucide-react"

interface SystemSettings {
  id?: number
  school_name: string
  logo_url: string
  academic_year: string
  contact_email: string
  contact_phone: string
  address: string
  transport_base_fee: number
  enable_homework_tracking: boolean
  enable_sms_alerts: boolean
  enable_parent_portal: boolean
  primary_color: string
  secondary_color: string
  dark_mode_enabled: boolean
}

interface SystemUser {
  id: number
  username: string
  email: string
  role: string
  full_name: string
  status: string
  created_at: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    school_name: "",
    logo_url: "",
    academic_year: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    transport_base_fee: 0,
    enable_homework_tracking: false,
    enable_sms_alerts: false,
    enable_parent_portal: false,
    primary_color: "#3b82f6",
    secondary_color: "#1e40af",
    dark_mode_enabled: false,
  })

  const [users, setUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "teacher",
    full_name: "",
  })

  useEffect(() => {
    fetchSettings()
    fetchUsers()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(data.settings)
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/settings/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert("Settings saved successfully!")
      } else {
        alert("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Error saving settings")
    } finally {
      setSaving(false)
    }
  }

  const createUser = async () => {
    try {
      const response = await fetch("/api/settings/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        alert("User created successfully!")
        setNewUser({
          username: "",
          email: "",
          password: "",
          role: "teacher",
          full_name: "",
        })
        fetchUsers()
      } else {
        alert("Failed to create user")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      alert("Error creating user")
    }
  }

  const deleteUser = async (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/settings/users/${userId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          alert("User deleted successfully!")
          fetchUsers()
        } else {
          alert("Failed to delete user")
        }
      } catch (error) {
        console.error("Error deleting user:", error)
        alert("Error deleting user")
      }
    }
  }

  const handleSettingChange = (field: keyof SystemSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure your school ERP system</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                School Information
              </CardTitle>
              <CardDescription>Basic school details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school_name">School Name</Label>
                  <Input
                    id="school_name"
                    value={settings.school_name}
                    onChange={(e) => handleSettingChange("school_name", e.target.value)}
                    placeholder="Enter school name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academic_year">Academic Year</Label>
                  <Input
                    id="academic_year"
                    value={settings.academic_year}
                    onChange={(e) => handleSettingChange("academic_year", e.target.value)}
                    placeholder="e.g., 2024-25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => handleSettingChange("contact_email", e.target.value)}
                    placeholder="admin@school.edu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={settings.contact_phone}
                    onChange={(e) => handleSettingChange("contact_phone", e.target.value)}
                    placeholder="+91-9876543210"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">School Address</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => handleSettingChange("address", e.target.value)}
                  placeholder="Enter complete school address"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo_url">School Logo URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo_url"
                    value={settings.logo_url}
                    onChange={(e) => handleSettingChange("logo_url", e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  <Button variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>Academic Configuration</CardTitle>
              <CardDescription>Configure academic year, terms, and grading system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Academic Year</Label>
                  <Input
                    value={settings.academic_year}
                    onChange={(e) => handleSettingChange("academic_year", e.target.value)}
                    placeholder="2024-25"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grading System</Label>
                  <Input placeholder="A+, A, B+, B, C" disabled />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Feature Toggles</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Homework Tracking</Label>
                      <p className="text-sm text-muted-foreground">Enable assignment and homework management</p>
                    </div>
                    <Switch
                      checked={settings.enable_homework_tracking}
                      onCheckedChange={(checked) => handleSettingChange("enable_homework_tracking", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Parent Portal</Label>
                      <p className="text-sm text-muted-foreground">Allow parents to access student information</p>
                    </div>
                    <Switch
                      checked={settings.enable_parent_portal}
                      onCheckedChange={(checked) => handleSettingChange("enable_parent_portal", checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transport">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5" />
                Transport Configuration
              </CardTitle>
              <CardDescription>Configure transport fees and routes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transport_base_fee">Base Transport Fee (Monthly)</Label>
                  <Input
                    id="transport_base_fee"
                    type="number"
                    value={settings.transport_base_fee}
                    onChange={(e) => handleSettingChange("transport_base_fee", Number.parseInt(e.target.value) || 0)}
                    placeholder="1500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fee Collection Day</Label>
                  <Input placeholder="1st of every month" disabled />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Transport Fee Structure:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Base fee: ₹{settings.transport_base_fee}/month</li>
                  <li>• Distance-based pricing available</li>
                  <li>• Sibling discount: 10%</li>
                  <li>• Annual payment discount: 5%</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New User
                </CardTitle>
                <CardDescription>Create login access for teachers and staff</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={newUser.full_name}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="user@school.edu"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      value={newUser.role}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                </div>
                <Button onClick={createUser} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create User
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  System Users ({users.length})
                </CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Username</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Role</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2">{user.full_name}</td>
                          <td className="border border-gray-200 px-4 py-2">{user.username}</td>
                          <td className="border border-gray-200 px-4 py-2">{user.email}</td>
                          <td className="border border-gray-200 px-4 py-2">
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => deleteUser(user.id)}>
                                <Trash2 className="h-4 w-4" />
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
          </div>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>Advanced system settings and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Appearance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={settings.primary_color}
                        onChange={(e) => handleSettingChange("primary_color", e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={settings.primary_color}
                        onChange={(e) => handleSettingChange("primary_color", e.target.value)}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={settings.secondary_color}
                        onChange={(e) => handleSettingChange("secondary_color", e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={settings.secondary_color}
                        onChange={(e) => handleSettingChange("secondary_color", e.target.value)}
                        placeholder="#1e40af"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable dark theme for the application</p>
                  </div>
                  <Switch
                    checked={settings.dark_mode_enabled}
                    onCheckedChange={(checked) => handleSettingChange("dark_mode_enabled", checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Alerts</Label>
                    <p className="text-sm text-muted-foreground">Send SMS notifications to parents</p>
                  </div>
                  <Switch
                    checked={settings.enable_sms_alerts}
                    onCheckedChange={(checked) => handleSettingChange("enable_sms_alerts", checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">System Information:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Database: PostgreSQL (Neon)</li>
                  <li>• Version: 1.0.0</li>
                  <li>• Last Backup: Today, 2:00 AM</li>
                  <li>• Storage Used: 2.5 GB / 10 GB</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
