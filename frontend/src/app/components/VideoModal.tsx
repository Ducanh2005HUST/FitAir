import { X } from 'lucide-react';

function toYoutubeEmbed(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    const id = u.searchParams.get('v');
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
}

export function VideoModal(props: { open: boolean; title?: string; youtubeUrl?: string; onClose: () => void }) {
  if (!props.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="text-sm font-medium truncate">{props.title ?? 'Video'}</div>
          <button className="p-2 rounded-lg hover:bg-gray-100" onClick={props.onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 h-full w-full"
            src={props.youtubeUrl ? toYoutubeEmbed(props.youtubeUrl) : undefined}
            title={props.title ?? 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

