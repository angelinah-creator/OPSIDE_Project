'use client'
import { BlankWorkspacePage } from '@/components/workspace/BlankWorkspacePage'
import { StickyNote } from 'lucide-react'
// Workspace client notes
export default function WorkspaceClientNotes() {
  return <BlankWorkspacePage title="Notes" icon={<StickyNote className="w-10 h-10 text-slate-300" />} />
}
