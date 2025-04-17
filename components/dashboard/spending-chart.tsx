'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export function SpendingChart() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const data = [
    { name: 'Housing', value: 1450, color: '#3b82f6' },
    { name: 'Food', value: 850, color: '#22c55e' },
    { name: 'Transportation', value: 450, color: '#eab308' },
    { name: 'Entertainment', value: 380, color: '#ec4899' },
    { name: 'Utilities', value: 320, color: '#8b5cf6' },
    { name: 'Other', value: 413.42, color: '#94a3b8' },
  ]
  
  if (!mounted) {
    return <div className="h-64 flex items-center justify-center">Loading chart...</div>
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-medium mb-4">Monthly Spending</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}