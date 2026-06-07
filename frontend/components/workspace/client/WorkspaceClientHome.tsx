'use client'
import { BlankWorkspacePage } from '@/components/workspace/BlankWorkspacePage'
import { Home } from 'lucide-react'
// Workspace client home
export default function WorkspaceClientHome() {
  return <BlankWorkspacePage title="Tableau de bord Client" icon={<Home className="w-10 h-10 text-slate-300" />} />
}
