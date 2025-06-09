"use client"

import { useState, useCallback } from 'react'
import { exportToPDF, exportToExcel, type ExportData, type ExportOptions } from '@/utils/exportUtils'
import { useToast } from '@/hooks/use-toast'

interface UseExportOptions extends ExportOptions {
  onSuccess?: (format: 'pdf' | 'excel') => void
  onError?: (error: Error, format: 'pdf' | 'excel') => void
}

export const useExport = (options: UseExportOptions = {}) => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportingFormat, setExportingFormat] = useState<'pdf' | 'excel' | null>(null)
  const { toast } = useToast()

  const exportData = useCallback(async (
    data: ExportData[],
    format: 'pdf' | 'excel',
    exportOptions?: ExportOptions
  ) => {
    if (!data || data.length === 0) {
      toast({
        title: 'No Data',
        description: 'No data available to export',
        variant: 'destructive'
      })
      return false
    }

    setIsExporting(true)
    setExportingFormat(format)

    try {
      const mergedOptions = { ...options, ...exportOptions }

      if (format === 'pdf') {
        exportToPDF(data, mergedOptions)
      } else {
        exportToExcel(data, mergedOptions)
      }

      toast({
        title: 'Export Successful',
        description: `${format.toUpperCase()} file has been downloaded successfully`
      })

      options.onSuccess?.(format)
      return true
    } catch (error) {
      const exportError = error instanceof Error ? error : new Error('Export failed')
      console.error('Export error:', exportError)
      
      toast({
        title: 'Export Failed',
        description: `Failed to export ${format.toUpperCase()} file. Please try again.`,
        variant: 'destructive'
      })

      options.onError?.(exportError, format)
      return false
    } finally {
      setIsExporting(false)
      setExportingFormat(null)
    }
  }, [options, toast])

  const exportToPdf = useCallback((data: ExportData[], exportOptions?: ExportOptions) => {
    return exportData(data, 'pdf', exportOptions)
  }, [exportData])

  const exportToExcel = useCallback((data: ExportData[], exportOptions?: ExportOptions) => {
    return exportData(data, 'excel', exportOptions)
  }, [exportData])

  return {
    isExporting,
    exportingFormat,
    exportData,
    exportToPdf,
    exportToExcel
  }
}

export default useExport