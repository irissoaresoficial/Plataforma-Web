'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import Marca from './Marca';

export default function SubNav({
  links,
  cta,
  ctaHref,
}: {
  links: { href: string; label: ReactNode; external?: boolean }[];
  cta: string;
  ctaHref: string;
}) {
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
        gap: 16,
        padding: '15px clamp(14px,3vw,36px)',
        transition: 'background .5s ease,backdrop-filter .5s ease,border-color .5s ease',
        borderBottom: '1px solid transparent',
      }}
    >
      <Link href="/" className="navtx" style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', color: '#F4F3EF' }}>
        <span>←</span>
        <Marca tam={28} />
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px,1.4vw,20px)' }}>
        {links.map((l) =>
          l.external ? (
            <a key={l.href} href={l.href} data-mag className="navtx nav-link" style={{ fontSize: 13, fontWeight: 500, color: '#F4F3EF', whiteSpace: 'nowrap' }}>
              {l.label}
            </a>
          ) : (
            <Link key={l.href} href={l.href} data-mag className="navtx nav-link" style={{ fontSize: 13, fontWeight: 500, color: '#F4F3EF', whiteSpace: 'nowrap' }}>
              {l.label}
            </Link>
          )
        )}
        <Link href={ctaHref} data-mag className="nav-cta" style={{ color: '#0A0A0C', background: '#C89B4A', whiteSpace: 'nowrap' }}>
          {cta}
        </Link>
      </div>
    </div>
  );
}
