'use client';

/**
 * EL SELLO DE LA ESCUELA, SUELTO.
 *
 * La plantilla que pasó Gerson traía aquí un logotipo geométrico dibujado en
 * SVG. No se usa: ese dibujo es de la plantilla, no de esta casa. El sello de
 * la escuela es el que ya está en `content/site.ts` y el que lleva la barra de
 * todas las demás páginas, y la portada no puede ir firmada con otra cosa.
 *
 * Viene en dos archivos, el de color y el blanco, porque es un PNG y un PNG no
 * se recolorea: `claro` elige el blanco, que es el que se lee sobre las fichas
 * oscuras. El de color va sobre el crema.
 */

import Image from 'next/image';
import { LOGO, LOGO_COLOR } from '@/content/site';

export default function Sello({ tam = 40, claro = false }: { tam?: number; claro?: boolean }) {
  return (
    <Image
      src={claro ? LOGO : LOGO_COLOR}
      alt=""
      width={tam}
      height={tam}
      className="casa-sello"
      style={{ width: tam, height: tam, objectFit: 'contain', display: 'block' }}
    />
  );
}
