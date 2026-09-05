import { useEffect } from 'react';

type Variant = { key: string; 名前: string };

type Props = {
  variants: Variant[];
  current: string;
};

/** PROTOTYPE専用フローティング切替バー。開発ビルドでのみ表示する */
export default function PrototypeSwitcher({ variants, current }: Props) {
  const 切り替える = (key: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('variant', key);
    window.history.replaceState(null, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const i = variants.findIndex((v) => v.key === current);
      const d = e.key === 'ArrowRight' ? 1 : -1;
      切り替える(variants[(i + d + variants.length) % variants.length].key);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  if (!import.meta.env.DEV) return null;
  const idx = variants.findIndex((v) => v.key === current);
  const i = idx >= 0 ? idx : 0;

  return (
    <div className="proto-switcher" role="navigation" aria-label="プロトタイプ切替">
      <button type="button" onClick={() => 切り替える(variants[(i - 1 + variants.length) % variants.length].key)}>
        ←
      </button>
      <span>
        {variants[i].key} — {variants[i].名前}
      </span>
      <button type="button" onClick={() => 切り替える(variants[(i + 1) % variants.length].key)}>
        →
      </button>
    </div>
  );
}
