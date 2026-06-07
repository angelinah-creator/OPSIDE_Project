'use client'
import { BlankWorkspacePage } from '@/components/workspace/BlankWorkspacePage'
import { ScrollText } from 'lucide-react'
// Workspace contrats
export default function WorkspaceContrats() {
  return <BlankWorkspacePage title="Mes Contrats" icon={<ScrollText className="w-10 h-10 text-slate-300" />} />
}
