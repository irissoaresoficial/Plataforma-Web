'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * Foto con hueco elegante mientras no exista el archivo.
 * En cuanto se sube la imagen a public/images/ aparece sola, sin tocar código.
 */
export default function Foto({
  src,
  alt,
  ratio = '3/4',
  /* El radio del sistema. Se puede pasar un valor propio —el retrato de la
     portada pide 0 porque la ficha se apoya en su canto— pero lo normal es no
     tocarlo: los bordes los decide la hoja de estilos, no cada llamada. */
  radius = 'var(--radio)',
  objectPosition = 'center 20%',
  priority = false,
  sizes = '(max-width: 900px) 100vw, 45vw',
  etiqueta,
  llenar = false,
}: {
  src: string;
  alt: string;
  ratio?: string;
  radius?: number | string;
  objectPosition?: string;
  priority?: boolean;
  sizes?: string;
  etiqueta?: string;
  /** Ocupa todo el alto del contenedor en vez de guardar una proporción. */
  llenar?: boolean;
}) {
  const [falla, setFalla] = useState(false);

  return (
    <div
      data-hov-img
      style={{
        position: 'relative',
        width: '100%',
        height: llenar ? '100%' : undefined,
        aspectRatio: llenar ? undefined : ratio,
        borderRadius: radius,
        overflow: 'hidden',
        background: 'var(--superficie)',
        border: falla ? '1px dashed var(--linea-2)' : 'none',
      }}
    >
      {falla ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background: 'repeating-linear-gradient(135deg,var(--linea) 0 1px,transparent 1px 14px)',
          }}
        >
          <span style={{ fontSize: 'var(--rotulo-tam)', fontWeight: 'var(--rotulo-peso)', letterSpacing: 'var(--rotulo-esp)', textTransform: 'uppercase', color: '#A33B3B', border: '1px solid #A33B3B', borderRadius: 100, padding: '4px 11px' }}>
            Foto pendiente
          </span>
          <code style={{ fontSize: 11, color: 'var(--tx-3)' }}>{src.replace('/images/', '')}</code>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFalla(true)}
          style={{
            objectFit: 'cover',
            objectPosition,
            transition: 'transform 1.2s cubic-bezier(.16,1,.3,1),filter .8s ease',
            filter: 'saturate(.94)',
          }}
        />
      )}
      {etiqueta && !falla && (
        <span
          style={{
            position: 'absolute',
            left: 16,
            bottom: 14,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: 'var(--tx)',
            background: 'var(--linea-2)',
            backdropFilter: 'blur(8px)',
            borderRadius: 100,
            padding: '6px 12px',
          }}
        >
          {etiqueta}
        </span>
      )}
    </div>
  );
}
