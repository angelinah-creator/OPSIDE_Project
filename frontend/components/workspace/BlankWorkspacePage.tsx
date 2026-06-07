'use client'
import { Construction } from 'lucide-react'

interface BlankWorkspacePageProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

// Blank workspace page
export function BlankWorkspacePage({ title, description, icon }: BlankWorkspacePageProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[500px] text-center p-12">
      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
        {icon || <Construction className="w-10 h-10 text-slate-300" />}
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-3">{title}</h2>
      <div className="mt-8 flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">En développement</span>
      </div>
    </div>
  )
}
