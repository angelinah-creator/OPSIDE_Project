'use client'

import { useEffect, useState } from 'react'
import { notificationService } from '@/lib/notification-service'
import { Bell, Check, Trash2, ExternalLink, Mail, Briefcase, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import clsx from 'clsx'
import { io } from 'socket.io-client'
import { getToken } from '@/lib/auth-service'

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()

    const token = getToken()
    if (!token) return

    const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    })

    socket.on('newNotification', () => {
      fetchNotifications()
    })

    socket.on('unreadCountUpdate', () => {
      fetchNotifications()
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll()
      setNotifications(data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      toast.success('Toutes les notifications sont lues')
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await notificationService.delete(id)
      setNotifications(notifications.filter(n => n.id !== id))
      toast.success('Notification supprimée')
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_application': return <Briefcase className="w-5 h-5 text-blue-500" />
      case 'match_confirmed': return <UserCheck className="w-5 h-5 text-green-500" />
      case 'match_request': return <Bell className="w-5 h-5 text-amber-500" />
      case 'sourcing_invitation': return <Mail className="w-5 h-5 text-purple-500" />
      default: return <Bell className="w-5 h-5 text-slate-400" />
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Chargement des notifications...</p>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
          <Bell className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune notification</h3>
        <p className="text-slate-500 max-w-sm">Vous êtes à jour ! Toutes les nouvelles alertes apparaîtront ici.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          Notifications 
          <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
            {notifications.filter(n => !n.read).length} non lues
          </span>
        </h2>
        <button
          onClick={handleMarkAllRead}
          className="text-sm font-bold text-accent hover:text-accent/80 transition-colors"
        >
          Tout marquer comme lu
        </button>
      </div>

      <div className="grid gap-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={clsx(
              "p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4",
              n.read 
                ? "bg-white border-slate-100 opacity-75" 
                : "bg-white border-accent/20 shadow-sm shadow-accent/5 ring-1 ring-accent/5"
            )}
            onClick={() => !n.read && handleMarkRead(n.id)}
          >
            <div className={clsx(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              n.read ? "bg-slate-50" : "bg-accent/5"
            )}>
              {getIcon(n.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className={clsx(
                  "text-sm font-bold truncate",
                  n.read ? "text-slate-600" : "text-slate-900"
                )}>
                  {n.title}
                </p>
                <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-4">
                  {new Date(n.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-3">
                {n.message}
              </p>
              
              {/* {n.link && (
                <Link
                  href={n.link}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                >
                  Voir les détails
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )} */}
            </div>

            {!n.read && (
              <div className="w-2 h-2 bg-accent rounded-full mt-2 shrink-0" />
            )}

            <button
              onClick={(e) => handleDelete(e, n.id)}
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-2"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
