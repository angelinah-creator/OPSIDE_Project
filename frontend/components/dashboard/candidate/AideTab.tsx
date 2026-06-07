'use client';

import { useEffect, useState } from 'react';
import { videoApi } from '@/lib/video-service';
import { Play, X } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  created_at: string;
}

// Aide tab
export default function AideTab() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchVideoUrl, setWatchVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch videos
    const fetchVideos = async () => {
      try {
        const data = await videoApi.getAll();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // Formate date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-[2rem]" />)}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="bg-white p-10 rounded-[2rem] border border-slate-200 text-center text-slate-500">
        Aucune vidéo d'aide n'est disponible pour le moment.
      </div>
    );
  }

  return (
    <div className="text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(vid => (
          <div key={vid.id} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
            <div className="relative bg-slate-900 aspect-video flex items-center justify-center cursor-pointer"
                 onClick={() => setWatchVideoUrl(vid.url)}>
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Play className="w-6 h-6 text-white ml-1" />
              </div>
            </div>
            <div className="p-6 md:p-8 flex-1 flex flex-col">
              <h3 className="font-bold text-slate-900 mb-2 text-lg leading-tight group-hover:text-accent transition-colors">{vid.title}</h3>
              <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-3">{vid.description}</p>
              <div className="pt-4 border-t border-slate-50 mt-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(vid.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Watch Modal */}
      {watchVideoUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <button 
            onClick={() => setWatchVideoUrl(null)} 
            className="absolute top-6 right-6 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
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
    </div>
  );
}
