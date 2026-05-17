'use client'
import { BlankWorkspacePage } from '@/components/workspace/BlankWorkspacePage'
import { Timer } from 'lucide-react'
export default function WorkspaceClientTimeTracking() {
  return <BlankWorkspacePage title="Time Tracking" icon={<Timer className="w-10 h-10 text-slate-300" />} />
}
