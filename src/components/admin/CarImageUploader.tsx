'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { FiRefreshCw, FiTrash2, FiUpload } from 'react-icons/fi';
import {
  ACCEPT_IMAGE_ATTR,
  CAR_IMAGE_REQUIREMENTS_SHORT,
  MAX_IMAGE_BYTES,
  MIN_HEIGHT,
  MIN_WIDTH,
  isAllowedImageType,
} from '@/lib/carImageConstraints';

type UploadedCarImage = {
  id: string;
  car_id: string;
  original_url: string;
  medium_url: string;
  thumb_url: string;
  sort_order: number;
};

type UploadItem = {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: 'queued' | 'uploading' | 'done' | 'error';
  error?: string;
};

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  if (typeof window !== 'undefined' && typeof window.createImageBitmap === 'function') {
    const bmp = await window.createImageBitmap(file);
    const width = bmp.width;
    const height = bmp.height;
    (bmp as any).close?.();
    return { width, height };
  }

  const url = URL.createObjectURL(file);
  try {
    const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('Invalid image'));
      img.src = url;
    });
    return dims;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function validateImageFile(file: File): Promise<string | null> {
  if (!isAllowedImageType(file.type || '')) {
    return 'Unsupported image type. Only JPEG, PNG, and WebP are allowed.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image too large. Max 10MB per image.';
  }
  try {
    const { width, height } = await getImageDimensions(file);
    if (width < MIN_WIDTH || height < MIN_HEIGHT) {
      return `Image resolution too small. Minimum ${MIN_WIDTH}x${MIN_HEIGHT}px.`;
    }
  } catch (e) {
    return 'Invalid image file.';
  }
  return null;
}

function uploadWithProgress({
  url,
  formData,
  onProgress,
  signal,
}: {
  url: string;
  formData: FormData;
  onProgress: (p: number) => void;
  signal?: AbortSignal;
}) {
  return new Promise<any>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.responseType = 'json';

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const pct = Math.round((e.loaded / e.total) * 100);
      onProgress(pct);
    };

    xhr.onload = () => {
      resolve(xhr.response);
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.onabort = () => reject(new Error('Upload aborted'));

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener('abort', () => xhr.abort(), { once: true });
    }

    xhr.send(formData);
  });
}

export default function CarImageUploader({
  carId,
  minImages = 5,
  onCountChange,
}: {
  carId: string;
  minImages?: number;
  onCountChange?: (count: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [serverImages, setServerImages] = useState<UploadedCarImage[]>([]);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const totalCount = serverImages.length;
  const isComplete = totalCount >= minImages;

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/admin/cars/${carId}/images`);
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setErrorMessage(json?.error || 'Failed to load images.');
        return;
      }
      setServerImages((json.data || []) as UploadedCarImage[]);
    } catch (e) {
      setErrorMessage('Failed to load images.');
    } finally {
      setLoading(false);
    }
  }, [carId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    onCountChange?.(serverImages.length);
  }, [serverImages.length, onCountChange]);

  const onFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    const items = await Promise.all(
      list.map(async (file) => {
        const previewUrl = URL.createObjectURL(file);
        const error = await validateImageFile(file);
        return {
          id: crypto.randomUUID(),
          file,
          previewUrl,
          progress: 0,
          status: (error ? 'error' : 'queued') as UploadItem['status'],
          error: error || undefined,
        };
      }),
    );
    setQueue((q) => [...q, ...items]);
  }, []);

  const handlePick = () => inputRef.current?.click();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length) void onFiles(e.dataTransfer.files);
  };

  const handleUploadOne = async (itemId: string) => {
    const item = queue.find((q) => q.id === itemId);
    if (!item) return;

    setQueue((q) => q.map((x) => (x.id === itemId ? { ...x, status: 'uploading', progress: 0, error: '' } : x)));
    const fd = new FormData();
    fd.append('files', item.file);

    try {
      const json = await uploadWithProgress({
        url: `/api/admin/cars/${carId}/images`,
        formData: fd,
        onProgress: (p) => setQueue((q) => q.map((x) => (x.id === itemId ? { ...x, progress: p } : x))),
      });
      if (!json?.ok) {
        setQueue((q) => q.map((x) => (x.id === itemId ? { ...x, status: 'error', error: json?.error || 'Upload failed' } : x)));
        return;
      }
      setQueue((q) => q.map((x) => (x.id === itemId ? { ...x, status: 'done', progress: 100 } : x)));
      await load();
    } catch (e: any) {
      setQueue((q) => q.map((x) => (x.id === itemId ? { ...x, status: 'error', error: e?.message || 'Upload failed' } : x)));
    }
  };

  const handleDelete = async (imageId: string) => {
    setErrorMessage('');
    try {
      const res = await fetch(`/api/admin/cars/${carId}/images/${imageId}`, { method: 'DELETE' });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setErrorMessage(json?.error || 'Failed to delete image.');
        return;
      }
      await load();
    } catch (e) {
      setErrorMessage('Failed to delete image.');
    }
  };

  const queuedCount = useMemo(() => queue.filter((q) => q.status === 'queued' || q.status === 'uploading').length, [queue]);

  useEffect(() => {
    return () => {
      for (const q of queue) URL.revokeObjectURL(q.previewUrl);
    };
  }, [queue]);

  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Photos</h4>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Upload at least {minImages} images. {CAR_IMAGE_REQUIREMENTS_SHORT}
          </p>
        </div>
        <button
          type="button"
          onClick={handlePick}
          className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-white hover:bg-gold-600"
        >
          <FiUpload /> Add Images
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_IMAGE_ATTR}
          multiple
          className="hidden"
          onChange={(e) => {
            if (!e.target.files) return;
            void onFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {errorMessage && (
        <div className="mt-3 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900 dark:text-red-100">
          {errorMessage}
        </div>
      )}

      <div
        className="mt-4 rounded-xl border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      onDrop={(e) => void handleDrop(e)}
      >
        <p className="text-sm text-gray-700 dark:text-gray-200">Drag & drop images here</p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {loading ? 'Loading existing images…' : `${totalCount} uploaded`}
          {queuedCount ? ` · ${queuedCount} in queue` : ''}
        </p>
        <div className="mt-2 text-xs">
          <span className={isComplete ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}>
            {isComplete ? 'Meets minimum requirement' : 'Not enough images yet'}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {serverImages.map((img) => (
            <div key={img.id} className="rounded-xl border border-gray-200 p-2 dark:border-gray-700">
              <div className="relative h-28 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                <Image src={img.thumb_url} alt="Car image" fill className="object-cover" />
              </div>
              <div className="mt-2 flex justify-between">
                <a
                  href={img.original_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  Open
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {queue.length > 0 && (
        <div className="mt-5 space-y-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">Upload queue</div>
          {queue.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Image src={item.previewUrl} alt={item.file.name} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-gray-900 dark:text-white">{item.file.name}</div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-full bg-gold-500" style={{ width: `${item.progress}%` }} />
                  </div>
                  {item.status === 'error' && (
                    <div className="mt-1 text-xs text-red-600 dark:text-red-400">{item.error || 'Upload failed'}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  {item.status === 'queued' && (
                    <button
                      type="button"
                      onClick={() => void handleUploadOne(item.id)}
                      className="rounded-lg bg-gray-900 px-3 py-2 text-xs text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                      Upload
                    </button>
                  )}
                  {item.status === 'error' && (
                    <button
                      type="button"
                      onClick={() => void handleUploadOne(item.id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                      <FiRefreshCw /> Retry
                    </button>
                  )}
                  {item.status === 'uploading' && (
                    <div className="rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      Uploading…
                    </div>
                  )}
                  {item.status === 'done' && (
                    <div className="rounded-lg bg-green-100 px-3 py-2 text-xs text-green-800 dark:bg-green-900 dark:text-green-100">
                      Done
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

