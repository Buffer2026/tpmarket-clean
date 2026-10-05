import { X } from 'lucide-react';
import { MediaFile } from './MediaUploader';

interface MediaLightboxProps {
  file: MediaFile | null;
  onClose: () => void;
}

export default function MediaLightbox({ file, onClose }: MediaLightboxProps) {
  if (!file) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F172A]/90 backdrop-blur-sm px-6"
      onClick={onClose}
    >
      <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Close preview"
          className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-lemon text-[#0F172A] flex items-center justify-center hover:scale-105 transition-all"
        >
          <X size={20} />
        </button>
        <div className="bg-darkcard rounded-3xl overflow-hidden border border-white/10">
          {file.type === 'image' ? (
            <img src={file.url} alt={file.file.name} className="w-full max-h-[70vh] object-contain" />
          ) : (
            <video src={file.url} controls autoPlay className="w-full max-h-[70vh]" />
          )}
        </div>
        <p className="text-white/80 text-xs text-center mt-3 truncate">{file.file.name}</p>
      </div>
    </div>
  );
}
