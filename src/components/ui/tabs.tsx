"use client"

import * as React from "react"
import { useState, useEffect } from 'react'

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

interface TabsListProps {
  className?: string
  children: React.ReactNode
}

interface TabsTriggerProps {
  value: string
  className?: string
  children: React.ReactNode
  disabled?: boolean
}

interface TabsContentProps {
  value: string
  className?: string
  children: React.ReactNode
}

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

export function Tabs({ 
  defaultValue, 
  value, 
  onValueChange, 
  className = "", 
  children 
}: TabsProps) {
  const [tabValue, setTabValue] = useState(value || defaultValue || "")
  
  const handleValueChange = (newValue: string) => {
    if (!value) {
      setTabValue(newValue)
    }
    onValueChange?.(newValue)
  }
  
  useEffect(() => {
    if (value) {
      setTabValue(value)
    }
  }, [value])
  
  return (
    <TabsContext.Provider value={{ value: tabValue, onValueChange: handleValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className = "", children }: TabsListProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, className = "", children, disabled = false }: TabsTriggerProps) {
  const context = React.useContext(TabsContext)
  
  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs component")
  }
  
  const isActive = context.value === value
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      data-state={isActive ? "active" : "inactive"}
      className={className}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className = "", children }: TabsContentProps) {
  const context = React.useContext(TabsContext)
  
  if (!context) {
    throw new Error("TabsContent must be used within a Tabs component")
  }
  
  const isActive = context.value === value
  
  if (!isActive) {
    return null
  }
  
  return (
    <div
      role="tabpanel"
      data-state={isActive ? "active" : "inactive"}
      className={className}
    >
      {children}
    </div>
  )
} 