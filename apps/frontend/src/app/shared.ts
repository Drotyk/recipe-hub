export const PAGE_SIZE = 24;

export type PageProps = {
  onNavigate: (path: string) => void;
  onMessage: (type: 'error' | 'success', text: string | null) => void;
};

export function formatDate(value?: string | null) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
