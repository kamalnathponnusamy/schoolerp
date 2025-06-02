"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCounterAnimation } from "@/hooks/use-counter-animation"
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnimatedStatCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: string
  gradient: string
  description?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: number
  prefix?: string
  suffix?: string
  onClick?: () => void
  delay?: number
}

export function AnimatedStatCard({
  title,
  value,
  icon: Icon,
  color,
  gradient,
  description,
  trend,
  trendValue,
  prefix = "",
  suffix = "",
  onClick,
  delay = 0,
}: AnimatedStatCardProps) {
  const animatedValue = useCounterAnimation(value, 2000 + delay)

  return (
    <Card
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-0",
        "bg-gradient-to-br from-white via-gray-50 to-white",
        "hover:from-white hover:via-blue-50 hover:to-purple-50",
      )}
      onClick={onClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-gradient-to-tr from-pink-400 to-orange-500 transform -translate-x-12 translate-y-12"></div>
      </div>

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold text-gray-900 tracking-tight">
                {prefix}
                {animatedValue.toLocaleString()}
                {suffix}
              </span>
              {trend && trendValue && (
                <div className="flex items-center space-x-1 ml-2">
                  {trend === "up" ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : trend === "down" ? (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  )}
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-blue-600",
                    )}
                  >
                    {trendValue}%
                  </span>
                </div>
              )}
            </div>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
          </div>

          {/* Icon Container */}
          <div
            className={cn(
              "relative flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg transition-all duration-300",
              "group-hover:shadow-xl group-hover:scale-110",
              gradient,
            )}
          >
            <Icon className="h-8 w-8 text-white" />

            {/* Pulse Animation */}
            <div className={cn("absolute inset-0 rounded-2xl opacity-75 animate-pulse", gradient)}></div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
          <div
            className={cn("h-1.5 rounded-full transition-all duration-1000", gradient)}
            style={{ width: `${Math.min((animatedValue / value) * 100, 100)}%` }}
          ></div>
        </div>

        {/* Trend Badge */}
        {trend && (
          <Badge
            variant="outline"
            className={cn(
              "text-xs border-0 px-2 py-1",
              trend === "up"
                ? "bg-green-50 text-green-700"
                : trend === "down"
                  ? "bg-red-50 text-red-700"
                  : "bg-blue-50 text-blue-700",
            )}
          >
            vs last month
          </Badge>
        )}
      </CardContent>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-pink-400/0 group-hover:from-blue-400/10 group-hover:via-purple-400/10 group-hover:to-pink-400/10 transition-all duration-500"></div>
    </Card>
  )
}
