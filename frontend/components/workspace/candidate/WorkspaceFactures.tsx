'use client'
import { BlankWorkspacePage } from '@/components/workspace/BlankWorkspacePage'
import { FileText } from 'lucide-react'
// Workspace factures
export default function WorkspaceFactures() {
  return <BlankWorkspacePage title="Mes Factures" icon={<FileText className="w-10 h-10 text-slate-300" />} />
}
