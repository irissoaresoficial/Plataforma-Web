'use client';

import { useLang, type Lang } from '@/lib/i18n';

export default function LangSwitch() {
  const { lang, setLang } = useLang();
  const pill = (on: boolean): React.CSSProperties => ({
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '.04em',
    padding: '6px 9px',
    borderRadius: 100,
    cursor: 'pointer',
    transition: 'background .35s ease,color .35s ease',
    background: on ? '#C89B4A' : 'transparent',
    color: on ? '#0A0A0C' : 'inherit',
    opacity: on ? 1 : 0.58,
  });

  return (
    <div
      id="langbox"
      style={{ display: 'flex', gap: 1, padding: 3, border: '1px solid rgba(244,243,239,.18)', borderRadius: 100 }}
    >
      {(['es', 'pt', 'en'] as Lang[]).map((l) => (
        <div key={l} onClick={() => setLang(l)} style={pill(lang === l)}>
          {l.toUpperCase()}
        </div>
      ))}
    </div>
  );
}
