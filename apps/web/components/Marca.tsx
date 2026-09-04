'use client';

import Image from 'next/image';
import { useState } from 'react';
import { LOGO, LOGO_COLOR } from '@/content/site';

/**
 * El sello de la escuela junto al nombre. Es la misma marca en la cabecera de
 * las cuatro páginas y en el pie, así solo se cambia aquí.
 *
 * `claro` pide la versión blanca, la que se lee sobre el granate. `auto` deja
 * que la decida el fondo que haya bajo la barra en cada momento: la barra es
 * fija y cruza bloques de granate y de papel, así que el sello cambia con ella.
 * Se pintan las dos y manda el CSS, para no repintar en cada scroll.
 *
 * Si faltara el archivo queda el nombre solo: nunca un icono roto.
 */
export default function Marca({
  tam = 28,
  texto = true,
  apilado = false,
  claro = false,
  auto = false,
}: {
  tam?: number;
  texto?: boolean;
  apilado?: boolean;
  claro?: boolean;
  auto?: boolean;
}) {
  const [ok, setOk] = useState(true);
  const comun = { display: 'block', width: tam, height: tam, objectFit: 'contain' as const };

  return (
    <span style={{ display: 'inline-flex', flexDirection: apilado ? 'column' : 'row', alignItems: apilado ? 'flex-start' : 'center', gap: apilado ? 14 : 9 }}>
      {ok &&
        (auto ? (
          <span style={{ position: 'relative', width: tam, height: tam, flexShrink: 0 }}>
            <Image className="sello-color" src={LOGO_COLOR} alt="" width={tam} height={tam} onError={() => setOk(false)} style={comun} />
            <Image className="sello-blanco" src={LOGO} alt="" width={tam} height={tam} style={{ ...comun, position: 'absolute', inset: 0 }} />
          </span>
        ) : (
          <Image src={claro ? LOGO : LOGO_COLOR} alt="" width={tam} height={tam} onError={() => setOk(false)} style={{ ...comun, opacity: 0.92 }} />
        ))}
      {texto && (
        <span style={{ fontSize: 15, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.2em', whiteSpace: 'nowrap' }}>
          Iris Soares
        </span>
      )}
    </span>
  );
}
