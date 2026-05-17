'use client'
import { BlankWorkspacePage } from '@/components/workspace/BlankWorkspacePage'
import { Home } from 'lucide-react'
export default function WorkspaceHome() {
  return <BlankWorkspacePage title="Tableau de bord Workspace" icon={<Home className="w-10 h-10 text-slate-300" />} />
}
