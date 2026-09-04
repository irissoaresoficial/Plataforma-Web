'use client';

import Image from 'next/image';
import { useState } from 'react';
import { LOGO } from '@/content/site';

/**
 * El sello de la escuela junto al nombre. Es la misma marca en la cabecera de
 * las cuatro páginas y en el pie, así solo se cambia aquí.
 *
 * Usa la versión blanca del logo, que es la que se lee sobre el fondo negro.
 * Si el archivo no estuviera, queda el nombre solo: nunca un icono roto.
 */
export default function Marca({ tam = 28, texto = true, apilado = false }: { tam?: number; texto?: boolean; apilado?: boolean }) {
  const [ok, setOk] = useState(true);
  return (
    <span style={{ display: 'inline-flex', flexDirection: apilado ? 'column' : 'row', alignItems: apilado ? 'flex-start' : 'center', gap: apilado ? 14 : 9 }}>
      {ok && (
        <Image
          src={LOGO}
          alt=""
          width={tam}
          height={tam}
          onError={() => setOk(false)}
          style={{ display: 'block', width: tam, height: tam, objectFit: 'contain', opacity: 0.92 }}
        />
      )}
      {texto && <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>iris soares</span>}
    </span>
  );
}
