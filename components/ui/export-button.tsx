"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react'
import { exportToPDF, exportToExcel, type ExportData, type ExportOptions } from '@/utils/exportUtils'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export interface ExportButtonProps {
  data: ExportData[]
  format: 'pdf' | 'excel'
  filename?: string
  title?: string
  subtitle?: string
  orientation?: 'portrait' | 'landscape'
  pageSize?: 'a4' | 'a3' | 'letter'
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  disabled?: boolean
  children?: React.ReactNode
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  format,
  filename,
  title,
  subtitle,
  orientation = 'portrait',
  pageSize = 'a4',
  className,
  variant = 'outline',
  size = 'sm',
  disabled = false,
  children
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    if (!data || data.length === 0) {
      toast({
        title: 'No Data',
        description: 'No data available to export',
        variant: 'destructive'
      })
      return
    }

    setIsExporting(true)

    try {
      const options: ExportOptions = {
        title,
        subtitle,
        filename,
        orientation,
        pageSize
      }

      if (format === 'pdf') {
        exportToPDF(data, options)
        toast({
          title: 'Export Successful',
          description: 'PDF file has been downloaded successfully'
        })
      } else if (format === 'excel') {
        exportToExcel(data, options)
        toast({
          title: 'Export Successful',
          description: 'Excel file has been downloaded successfully'
        })
      }
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Export Failed',
        description: `Failed to export ${format.toUpperCase()} file. Please try again.`,
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getIcon = () => {
    if (isExporting) {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }
    
    if (format === 'pdf') {
      return <FileText className="h-4 w-4" />
    }
    
    return <FileSpreadsheet className="h-4 w-4" />
  }

  const getButtonText = () => {
    if (children) return children
    
    if (isExporting) {
      return `Exporting ${format.toUpperCase()}...`
    }
    
    return format.toUpperCase()
  }

  const getButtonColor = () => {
    if (format === 'pdf') {
      return 'hover:bg-red-50 hover:text-red-700 hover:border-red-300'
    }
    return 'hover:bg-green-50 hover:text-green-700 hover:border-green-300'
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={disabled || isExporting || !data || data.length === 0}
      className={cn(
        'flex items-center gap-2 transition-colors',
        getButtonColor(),
        className
      )}
    >
      {getIcon()}
      {getButtonText()}
    </Button>
  )
}

export default ExportButton