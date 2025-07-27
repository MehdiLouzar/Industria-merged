'use client'

import * as Icons from 'lucide-react'

export default function DynamicIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null
  const Icon = (Icons as Record<string, React.FC<{ className?: string }>>)[name]
  if (!Icon) return null
  return <Icon className={className} />
}
