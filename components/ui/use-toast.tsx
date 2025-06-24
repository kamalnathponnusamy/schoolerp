// components/ui/use-toast.tsx
'use client'

import { useContext, useRef, useState, createContext, ReactNode } from 'react'

interface Toast {
  id: string
  title: string
  description?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const count = useRef(0)

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = String(count.current++)
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => removeToast(id), toast.duration || 3000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}
