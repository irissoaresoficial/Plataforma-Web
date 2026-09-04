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
    background: on ? 'var(--oro)' : 'transparent',
    color: on ? '#2B1A1E' : 'inherit',
    // El idioma que no está puesto seguía siendo legible, pero justo por debajo
    // del mínimo: 0.58 de opacidad lo dejaba en 4.1:1.
    opacity: on ? 1 : 0.72,
  });

  return (
    <div
      id="langbox"
      style={{ display: 'flex', gap: 1, padding: 3, border: '1px solid var(--linea-2)', borderRadius: 100 }}
    >
      {(['es', 'pt', 'en'] as Lang[]).map((l) => (
        <div key={l} onClick={() => setLang(l)} style={pill(lang === l)}>
          {l.toUpperCase()}
        </div>
      ))}
    </div>
  );
}
