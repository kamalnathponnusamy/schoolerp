"use client"

import React from 'react'
import { ExportButton, type ExportButtonProps } from './export-button'
import { cn } from '@/lib/utils'

interface ExportGroupProps {
  data: ExportButtonProps['data']
  filename?: string
  title?: string
  subtitle?: string
  orientation?: 'portrait' | 'landscape'
  pageSize?: 'a4' | 'a3' | 'letter'
  className?: string
  buttonSize?: 'default' | 'sm' | 'lg'
  showLabels?: boolean
}

export const ExportGroup: React.FC<ExportGroupProps> = ({
  data,
  filename,
  title,
  subtitle,
  orientation = 'portrait',
  pageSize = 'a4',
  className,
  buttonSize = 'sm',
  showLabels = true
}) => {
  const baseProps = {
    data,
    filename,
    title,
    subtitle,
    orientation,
    pageSize,
    size: buttonSize
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ExportButton
        {...baseProps}
        format="pdf"
        variant="outline"
        className="border-red-200 text-red-700 hover:bg-red-50"
      >
        {showLabels ? 'PDF' : undefined}
      </ExportButton>
      
      <ExportButton
        {...baseProps}
        format="excel"
        variant="outline"
        className="border-green-200 text-green-700 hover:bg-green-50"
      >
        {showLabels ? 'Excel' : undefined}
      </ExportButton>
    </div>
  )
}

export default ExportGroup