'use client'

import { useEffect, useState, useRef } from 'react'
import { videoApi } from '@/lib/video-service'
import { Plus, Trash2, Edit, Play, X, UploadCloud, CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import clsx from 'clsx'

interface Video {
  id: string
  title: string
  description?: string
  url: string
  created_at: string
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [watchVideoUrl, setWatchVideoUrl] = useState<string | null>(null)
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null)
  
  // Form State
  const [currentVideo, setCurrentVideo] = useState<Partial<Video>>({})
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const data = await videoApi.getAll()
      setVideos(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !currentVideo.title) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', currentVideo.title)
      if (currentVideo.description) {
        formData.append('description', currentVideo.description)
      }

      await videoApi.create(formData)
      setIsUploadModalOpen(false)
      setCurrentVideo({})
      setFile(null)
      fetchVideos()
    } catch (error) {
      console.error(error)
      alert("Erreur lors de l'upload")
    } finally {
      setUploading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentVideo.id) return

    setUploading(true)
    try {
      await videoApi.update(currentVideo.id, {
        title: currentVideo.title,
        description: currentVideo.description
      })
      setIsEditModalOpen(false)
      setCurrentVideo({})
      fetchVideos()
    } catch (error) {
      console.error(error)
      alert("Erreur lors de la modification")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (vid: Video) => {
    setVideoToDelete(vid)
  }

  const confirmDelete = async () => {
    if (!videoToDelete) return
    
    setUploading(true)
    try {
      await videoApi.delete(videoToDelete.id)
      setVideoToDelete(null)
      fetchVideos()
    } catch (error) {
      console.error(error)
      alert("Erreur lors de la suppression")
    } finally {
      setUploading(false)
    }
  }

  const openEditModal = (vid: Video) => {
    setCurrentVideo(vid)
    setIsEditModalOpen(true)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vidéos d'aide</h1>
          <p className="text-slate-500 text-sm mt-1">Gérez les vidéos de préparation aux entretiens.</p>
        </div>
        <Button 
          onClick={() => {
            setCurrentVideo({})
            setFile(null)
            setIsUploadModalOpen(true)
          }}
          className="flex items-center gap-2 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Ajouter une vidéo
        </Button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-500">
          Aucune vidéo pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(vid => (
            <div key={vid.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="relative bg-slate-900 aspect-video group flex items-center justify-center cursor-pointer"
                   onClick={() => setWatchVideoUrl(vid.url)}>
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 text-white ml-1" />
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 mb-1 line-clamp-2">{vid.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{vid.description || 'Aucune description'}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <span className="text-xs font-medium text-slate-400">{formatDate(vid.created_at)}</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(vid)} className="p-2 text-slate-400 hover:text-accent hover:bg-slate-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(vid)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Ajouter une vidéo</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Titre</label>
                <input 
                  type="text" required
                  value={currentVideo.title || ''}
                  onChange={e => setCurrentVideo({...currentVideo, title: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description (optionnel)</label>
                <textarea 
                  value={currentVideo.description || ''}
                  onChange={e => setCurrentVideo({...currentVideo, description: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Fichier Vidéo (.mp4, etc.)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={clsx(
                    "relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer text-center group",
                    file 
                      ? "border-accent" 
                      : "border-slate-200 hover:border-accent hover:bg-slate-50"
                  )}
                >
                  <input 
                    type="file" accept="video/*"
                    ref={fileInputRef}
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate max-w-[250px] mx-auto">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          if(fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-xs font-bold text-accent bg-accent/10 hover:bg-accent/20 hover:text-accent mt-2  px-3 py-1 rounded-lg transition-colors"
                      >
                        Changer de fichier
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">Cliquez pour sélectionner une vidéo</p>
                      <p className="text-xs text-slate-400 font-medium">MP4, MOV, MPEG (Max 50MB)</p>
                    </div>
                  )}
                </div>
              </div>
              <Button type="submit" disabled={uploading || !file || !currentVideo.title} className="w-full rounded-xl py-3 mt-2">
                {uploading ? 'Upload en cours...' : 'Mettre en ligne'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Modifier la vidéo</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Titre</label>
                <input 
                  type="text" required
                  value={currentVideo.title || ''}
                  onChange={e => setCurrentVideo({...currentVideo, title: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea 
                  value={currentVideo.description || ''}
                  onChange={e => setCurrentVideo({...currentVideo, description: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none min-h-[100px]"
                />
              </div>
              <Button type="submit" disabled={uploading || !currentVideo.title} className="w-full rounded-xl py-3 mt-2">
                {uploading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Watch Modal */}
      {watchVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <button 
            onClick={() => setWatchVideoUrl(null)} 
            className="absolute top-6 right-6 text-white/50 hover:text-white p-2"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            <video 
              src={watchVideoUrl} 
              controls 
              autoPlay 
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {videoToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Supprimer la vidéo ?</h2>
            <p className="text-slate-500 text-sm mb-8">
              Êtes-vous sûr de vouloir supprimer "<span className="font-semibold">{videoToDelete.title}</span>" ? Cette action est irréversible.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setVideoToDelete(null)}
                className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                disabled={uploading}
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                disabled={uploading}
              >
                {uploading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
