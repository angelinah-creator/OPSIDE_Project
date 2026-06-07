'use client'
import { BlankWorkspacePage } from '@/components/workspace/BlankWorkspacePage'
import { FileText } from 'lucide-react'
// Workspace client factures
export default function WorkspaceClientFactures() {
  return <BlankWorkspacePage title="Factures" icon={<FileText className="w-10 h-10 text-slate-300" />} />
}
