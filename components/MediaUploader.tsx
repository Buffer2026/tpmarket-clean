import { useRef, useState, useEffect, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, X, PlayCircle } from 'lucide-react';

export interface MediaFile {
  id: string;
  file: File;
  url: string;
  type: 'image' | 'video';
  progress: number;
  ready: boolean;
}

interface MediaUploaderProps {
  buttonLabel: string;
  helperText: string;
  exampleText?: string;
  onOpenLightbox: (file: MediaFile) => void;
  onChange?: (files: MediaFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  maxVideoSeconds?: number;
}

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.onloadedmetadata = () => {
      const duration = videoEl.duration;
      URL.revokeObjectURL(videoEl.src);
      resolve(duration);
    };
    videoEl.onerror = () => reject(new Error('unreadable'));
    videoEl.src = URL.createObjectURL(file);
  });
}

export default function MediaUploader({
  buttonLabel,
  helperText,
  exampleText,
  onOpenLightbox,
  onChange,
  maxFiles = 5,
  maxSizeMB = 50,
  maxVideoSeconds = 60,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    onChange?.(mediaFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaFiles]);

  function startProgress(id: string) {
    const interval = setInterval(() => {
      setMediaFiles((prev) =>
        prev.map((f) => {
          if (f.id !== id || f.ready) return f;
          const next = Math.min(100, f.progress + Math.floor(Math.random() * 20) + 15);
          return { ...f, progress: next, ready: next >= 100 };
        })
      );
    }, 180);
    setTimeout(() => clearInterval(interval), 2500);
  }

  async function addFiles(fileList: FileList | File[]) {
    setError('');
    const incoming = Array.from(fileList);
    const room = maxFiles - mediaFiles.length;
    if (room <= 0) {
      setError(`You can upload up to ${maxFiles} files.`);
      return;
    }
    const toProcess = incoming.slice(0, room);
    if (incoming.length > toProcess.length) {
      setError(`Only ${room} more file(s) can be added (max ${maxFiles}).`);
    }

    for (const file of toProcess) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        setError('Only image and video files are supported.');
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`${file.name} is over the ${maxSizeMB}MB limit.`);
        continue;
      }
      if (isVideo) {
        try {
          const duration = await readVideoDuration(file);
          if (duration > maxVideoSeconds) {
            setError(`${file.name} is longer than ${maxVideoSeconds} seconds.`);
            continue;
          }
        } catch {
          // if duration can't be read, let it through
        }
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const url = URL.createObjectURL(file);
      const newFile: MediaFile = { id, file, url, type: isVideo ? 'video' : 'image', progress: 0, ready: false };
      setMediaFiles((prev) => [...prev, newFile]);
      startProgress(id);
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  }

  function removeFile(id: string) {
    setMediaFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((f) => f.id !== id);
    });
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          dragOver ? 'border-sky bg-sky/10' : 'border-white/20 bg-white/5'
        }`}
      >
        <UploadCloud className={`mx-auto mb-3 ${dragOver ? 'text-sky' : 'text-slate'}`} size={28} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="bg-lemon text-[#0F172A] font-black text-sm px-5 py-2.5 rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(204,255,0,0.5)] transition-all"
        >
          {buttonLabel}
        </button>
        <p className="text-slate text-xs mt-3">{helperText}</p>
        {exampleText && <p className="text-slate/70 text-xs italic mt-1">{exampleText}</p>}
        <p className="text-slate/60 text-[11px] mt-2">
          Drag & drop here · Max {maxFiles} files · {maxSizeMB}MB each · videos up to {maxVideoSeconds}s
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {error && <p className="text-yellow text-xs font-semibold mt-2">{error}</p>}

      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {mediaFiles.map((f) => (
            <div key={f.id} className="relative aspect-square rounded-xl overflow-hidden bg-white/10">
              <button
                type="button"
                onClick={() => f.ready && onOpenLightbox(f)}
                className="absolute inset-0 w-full h-full"
              >
                {f.type === 'image' ? (
                  <img src={f.url} alt={f.file.name} className="w-full h-full object-cover" />
                ) : (
                  <video src={f.url} muted className="w-full h-full object-cover" />
                )}
                {f.type === 'video' && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <PlayCircle className="text-white drop-shadow" size={28} />
                  </span>
                )}
              </button>

              {!f.ready && (
                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-1">
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-lemon transition-all" style={{ width: `${f.progress}%` }} />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => removeFile(f.id)}
                aria-label="Remove file"
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#0F172A]/80 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
