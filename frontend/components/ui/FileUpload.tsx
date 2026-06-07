'use client';
import { useState, useRef } from 'react';

interface FileUploadProps {
  label?: string;
  accept?: string;
  onUpload: (file: File) => Promise<void>;
  currentUrl?: string;
  type?: 'image' | 'document';
  hint?: string;
  preview?: string;
}

// File upload
export default function FileUpload({
  label,
  accept = 'image/*',
  onUpload,
  currentUrl,
  type = 'image',
  hint,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  // Gère change
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-[#1A1A1A]">{label}</label>}
      <div
        onClick={() => ref.current?.click()}
        className="relative cursor-pointer border-2 border-dashed border-[#E5E5E5] rounded-xl p-6 hover:border-purple-300 hover:bg-purple-50 transition-all text-center group"
      >
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
        {type === 'image' && preview ? (
          <div className="flex flex-col items-center gap-2">
            <img src={preview} alt="preview" className="w-20 h-20 rounded-full object-cover border-2 border-[#E5E5E5]" />
            <span className="text-xs text-purple-600 font-medium">Cliquer pour changer</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#EFEFEF] group-hover:bg-purple-100 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-[#6B6B6B] group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            {fileName ? (
              <span className="text-xs text-[#4B4B4B] font-medium">{fileName}</span>
            ) : (
              <div>
                <p className="text-sm font-medium text-[#4B4B4B] group-hover:text-purple-600">Cliquer pour uploader</p>
                {hint && <p className="text-xs text-[#AEAEAE] mt-0.5">{hint}</p>}
              </div>
            )}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
            <svg className="animate-spin h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
