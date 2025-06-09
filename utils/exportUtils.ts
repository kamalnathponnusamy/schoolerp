import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export interface ExportData {
  [key: string]: any
}

export interface ExportOptions {
  title?: string
  subtitle?: string
  filename?: string
  orientation?: 'portrait' | 'landscape'
  pageSize?: 'a4' | 'a3' | 'letter'
}

/**
 * Export data to PDF format
 */
export const exportToPDF = (
  data: ExportData[],
  options: ExportOptions = {}
): void => {
  if (!data || data.length === 0) {
    console.warn('No data provided for PDF export')
    return
  }

  const {
    title = 'Report',
    subtitle = `Generated on ${new Date().toLocaleDateString()}`,
    filename = 'report.pdf',
    orientation = 'portrait',
    pageSize = 'a4'
  } = options

  try {
    // Create new PDF document
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize
    })

    // Set document properties
    doc.setProperties({
      title: title,
      creator: 'School Management System',
      author: 'EduPro'
    })

    // Add title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(title, 14, 22)

    // Add subtitle
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(subtitle, 14, 32)

    // Extract headers from first data object
    const headers = Object.keys(data[0])
    const formattedHeaders = headers.map(header => 
      header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    )

    // Format data for table
    const tableData = data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Format different data types
        if (typeof value === 'number') {
          return value.toLocaleString()
        }
        if (typeof value === 'boolean') {
          return value ? 'Yes' : 'No'
        }
        if (value instanceof Date) {
          return value.toLocaleDateString()
        }
        return String(value || '')
      })
    )

    // Add table
    autoTable(doc, {
      head: [formattedHeaders],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue color
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // Light gray
      },
      margin: { top: 40, right: 14, bottom: 20, left: 14 },
    })

    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      )
    }

    // Save the PDF
    doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF export')
  }
}

/**
 * Export data to Excel format
 */
export const exportToExcel = (
  data: ExportData[],
  options: ExportOptions = {}
): void => {
  if (!data || data.length === 0) {
    console.warn('No data provided for Excel export')
    return
  }

  const {
    title = 'Report',
    filename = 'report.xlsx'
  } = options

  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new()

    // Format headers to be more readable
    const formattedData = data.map(row => {
      const formattedRow: { [key: string]: any } = {}
      Object.keys(row).forEach(key => {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        let value = row[key]
        
        // Format different data types
        if (typeof value === 'boolean') {
          value = value ? 'Yes' : 'No'
        } else if (value instanceof Date) {
          value = value.toLocaleDateString()
        }
        
        formattedRow[formattedKey] = value
      })
      return formattedRow
    })

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(formattedData)

    // Set column widths
    const columnWidths = Object.keys(formattedData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15) // Minimum width of 15 characters
    }))
    worksheet['!cols'] = columnWidths

    // Add title row
    XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: 'A1' })
    XLSX.utils.sheet_add_aoa(worksheet, [[`Generated on ${new Date().toLocaleDateString()}`]], { origin: 'A2' })
    
    // Shift data down to make room for title
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    range.e.r += 3 // Add 3 rows for title and spacing
    worksheet['!ref'] = XLSX.utils.encode_range(range)

    // Style the title cell
    if (worksheet['A1']) {
      worksheet['A1'].s = {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: 'center' }
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')

    // Save the file
    XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
  } catch (error) {
    console.error('Error generating Excel file:', error)
    throw new Error('Failed to generate Excel export')
  }
}

/**
 * Utility function to format data for export
 */
export const formatDataForExport = (
  data: any[],
  columnMapping?: { [key: string]: string }
): ExportData[] => {
  if (!data || data.length === 0) return []

  return data.map(item => {
    const formattedItem: ExportData = {}
    
    Object.keys(item).forEach(key => {
      const displayKey = columnMapping?.[key] || key
      formattedItem[displayKey] = item[key]
    })
    
    return formattedItem
  })
}

/**
 * Generate filename with timestamp
 */
export const generateFilename = (baseName: string, extension: string): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  return `${baseName}_${timestamp}.${extension}`
}