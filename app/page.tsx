"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { GraduationCap, Users, BookOpen, Eye, EyeOff, Shield, TrendingUp, Globe, Star } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response not ok:", response.status, errorText)
        alert(`Login failed: ${response.status} - ${errorText}`)
        return
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text()
        console.error("Response is not JSON:", responseText)
        alert("Server error: Invalid response format")
        return
      }

      const result = await response.json()
      console.log("Login successful:", result)

      localStorage.setItem("user", JSON.stringify(result.user))
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      alert("Login failed. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const demoCredentials = [
    {
      role: "Admin",
      username: "admin@school.edu",
      password: "password123",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      role: "Teacher",
      username: "teacher@school.edu",
      password: "password123",
      color: "bg-gradient-to-r from-green-500 to-teal-500",
    },
    {
      role: "Student",
      username: "student@school.edu",
      password: "password123",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
  ]

  const features = [
    { icon: Users, title: "Student Management", desc: "Complete student lifecycle management" },
    { icon: BookOpen, title: "Academic Excellence", desc: "Advanced curriculum and assessment tools" },
    { icon: TrendingUp, title: "Analytics & Reports", desc: "Real-time insights and performance tracking" },
    { icon: Shield, title: "Secure & Reliable", desc: "Enterprise-grade security and data protection" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fillRule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fillOpacity=&quot;0.1&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;1&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 text-white">
          <div className="max-w-lg">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="h-3 w-3 text-yellow-900" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  EduPro
                </h1>
                <p className="text-blue-200 text-sm">Advanced School Management</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Transform Your School with
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {" "}
                  Smart Technology
                </span>
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Experience the future of education management with our comprehensive, AI-powered platform designed for
                modern schools.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <feature.icon className="h-8 w-8 text-blue-300 mb-2" />
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-blue-200 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-blue-200 text-sm">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-blue-200 text-sm">Schools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-blue-200 text-sm">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-12">
          <div className="max-w-md mx-auto w-full">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white ml-3">EduPro</h1>
            </div>

            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-gray-600">Sign in to access your dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700 font-medium">
                      Username / Email
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={credentials.username}
                      onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter your username or email"
                      className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={credentials.password}
                        onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter your password"
                        className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 pr-12"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={checked => setRememberMe(checked === true)}
                        />
                      <Label htmlFor="remember" className="text-sm text-gray-600">
                        Remember me
                      </Label>
                    </div>
                    <Button variant="link" className="text-sm text-purple-600 hover:text-purple-700 p-0">
                      Forgot password?
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500 font-medium">Demo Credentials</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {demoCredentials.map((demo, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 ${demo.color} rounded-lg flex items-center justify-center shadow-md`}
                          >
                            <span className="text-white font-bold text-sm">{demo.role[0]}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{demo.role}</p>
                            <p className="text-xs text-gray-600">{demo.username}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                          onClick={() => setCredentials({ username: demo.username, password: demo.password })}
                        >
                          Use
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    Need help? Contact{" "}
                    <a href="mailto:support@edupro.com" className="text-purple-600 hover:text-purple-700 font-medium">
                      support@edupro.com
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Academic Year Badge */}
            <div className="flex justify-center mt-6">
              <Badge variant="outline" className="bg-white/90 text-gray-700 border-gray-200 px-4 py-2">
                <Globe className="w-4 h-4 mr-2" />
                Academic Year 2024-25
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
