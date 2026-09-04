'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import LangSwitch from './LangSwitch';

export default function HomeNav({ onBook }: { onBook: () => void }) {
  const { t } = useLang();
  return (
    <div
      id="nav"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 18,
        padding: '16px clamp(14px,3vw,36px)',
        transition: 'background .5s ease,backdrop-filter .5s ease,border-color .5s ease',
        borderBottom: '1px solid transparent',
      }}
    >
      <a href="#top" className="navtx" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em', color: '#F4F3EF' }}>
        iris soares
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px,1.2vw,20px)' }}>
        <a href="#metodo" data-mag className="navtx nav-link" style={{ fontSize: 13, fontWeight: 500, color: '#F4F3EF', whiteSpace: 'nowrap' }}>
          {t.n1}
        </a>
        <Link href="/sinergia" data-mag className="navtx nav-link" style={{ fontSize: 13, fontWeight: 500, color: '#F4F3EF', whiteSpace: 'nowrap' }}>
          {t.n2}
        </Link>
        <Link href="/cursos" data-mag className="navtx nav-link" style={{ fontSize: 13, fontWeight: 500, color: '#F4F3EF', whiteSpace: 'nowrap' }}>
          {t.n3}
        </Link>
        <Link href="/membresia" data-mag className="navtx nav-link" style={{ fontSize: 13, fontWeight: 500, color: '#F4F3EF', whiteSpace: 'nowrap' }}>
          {t.n4}
        </Link>
        <LangSwitch />
        <div id="navbtn" onClick={onBook} data-mag className="nav-cta" style={{ color: '#0A0A0C', background: '#F4F3EF', whiteSpace: 'nowrap' }}>
          {t.book}
        </div>
      </div>
    </div>
  );
}
