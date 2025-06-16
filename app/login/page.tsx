'use client';

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Users, BookOpen, Eye, EyeOff, Shield, TrendingUp, Globe, Star } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response not ok:", response.status, errorText);
        alert(`Login failed: ${response.status} - ${errorText}`);
        return;
      }

      const result = await response.json();
      console.log("Login successful:", result);

      // Store user data in localStorage and set cookie
      localStorage.setItem("user", JSON.stringify(result.user));
      document.cookie = `user=${JSON.stringify(result.user)}; path=/; max-age=86400`; // 24 hours

      // Redirect based on user role
      switch (result.user.role) {
        case 'student':
          router.replace('/student/dashboard');
          break;
        case 'teacher':
          router.replace('/teacher/dashboard');
          break;
        case 'admin':
          router.replace('/dashboard');
          break;
        default:
          router.replace('/');
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

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
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-200" />
                <span className="text-sm">Secure Platform</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-200" />
                <span className="text-sm">Real-time Analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-200" />
                <span className="text-sm">User Management</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-200" />
                <span className="text-sm">Academic Tools</span>
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
              <CardContent>
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
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
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

                {/* Demo Credentials */}
                <div className="mt-6 space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Demo Credentials</p>
                  </div>
                  <div className="space-y-2">
                    {[
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
                    ].map((cred, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full ${cred.color} flex items-center justify-center`}>
                            <span className="text-white text-xs font-medium">
                              {cred.role[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{cred.role}</p>
                            <p className="text-xs text-gray-500">{cred.username}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() =>
                            setCredentials({
                              username: cred.username,
                              password: cred.password,
                            })
                          }
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
  );
} 