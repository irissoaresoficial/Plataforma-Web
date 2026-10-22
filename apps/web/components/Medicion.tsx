'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { recuerdaCampana } from '@/lib/campana';
import { LLAVE_MEDICION, PIXEL_META } from '@/lib/pixel';

/**
 * ============================================================================
 * LA MEDICIÓN, Y LA PUERTA QUE HAY QUE PASAR PARA ENCENDERLA
 * ============================================================================
 *
 * El píxel de Meta y la etiqueta de Google. Y, delante, lo que la ley obliga a
 * poner delante.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ HAY UN CARTEL Y NO SE CARGA DIRECTAMENTE
 * ---------------------------------------------------------------------------
 * Un píxel publicitario deja cookies y manda la visita a un tercero. En España
 * eso exige consentimiento PREVIO, informado y con la misma facilidad para
 * decir que no que para decir que sí. No es un trámite: es lo que separa una
 * web legal de una multa, y la Agencia de Protección de Datos lleva años
 * multando exactamente esto.
 *
 * De ahí las tres reglas del cartel:
 *
 *   1. No se carga NADA antes de que la persona diga que sí. Ni el script.
 *   2. «No, gracias» está igual de a mano que «Aceptar». Mismo tamaño, mismo
 *      sitio, sin trucos de color ni una equis escondida en una esquina.
 *   3. La decisión se guarda en el propio navegador y no se vuelve a preguntar.
 *
 * ---------------------------------------------------------------------------
 * Y SI NO HAY IDENTIFICADORES, NO HAY NADA: NI CARTEL
 * ---------------------------------------------------------------------------
 * Mientras no existan las variables de entorno, este componente devuelve `null`
 * y la web se comporta exactamente igual que antes: sin cookies de terceros y
 * sin cartel. Preguntar por un consentimiento que no se va a usar sería molestar
 * por deporte.
 *
 * O sea que esto se puede publicar HOY, quedarse dormido, y despertarse solo el
 * día que se cree la cuenta de anuncios y se rellenen dos variables en Vercel:
 *
 *     NEXT_PUBLIC_META_PIXEL_ID    el número del píxel de Meta
 *     NEXT_PUBLIC_GOOGLE_TAG_ID    G-XXXXXXX (Analytics) o AW-XXXXXXX (Ads)
 *
 * ---------------------------------------------------------------------------
 * OJO AL TEXTO LEGAL
 * ---------------------------------------------------------------------------
 * La página de privacidad decía «esta web no usa cookies de publicidad ni de
 * seguimiento». Al encender esto deja de ser verdad, así que ese texto se ha
 * cambiado a la vez que este archivo. Si algún día se quita la medición, hay
 * que volver a cambiarlo. Una política de privacidad que no describe lo que la
 * web hace de verdad es peor que no tenerla.
 */

/* EL NÚMERO DEL PÍXEL Y LA LLAVE DEL CARTEL SE HAN MUDADO a `lib/pixel.ts`,
   con el porqué de cada uno escrito al lado. Se fueron de aquí el día que el
   servidor también necesitó saberlos: ahora el registro le llega a Meta por dos
   vías —este píxel y la API del servidor, en `lib/capi.ts`— y las dos tienen
   que apuntar al mismo píxel. Dos copias del número habrían sido, algún día,
   dos números distintos. */
const META = PIXEL_META;
const LLAVE = LLAVE_MEDICION;
const GOOGLE = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID;

export default function Medicion() {
  /** `null` mientras no se sabe; luego, lo que haya decidido la persona. */
  const [decision, setDecision] = useState<'si' | 'no' | null>(null);
  const [leido, setLeido] = useState(false);

  useEffect(() => {
    /* DE QUÉ ANUNCIO VIENE, Y ESTO VA ANTES DE TODO LO DEMÁS.
       Se apunta la cola de la dirección (`utm_source`, `utm_campaign`…) en
       cuanto carga la página, porque si la persona navega a otra sección esa
       cola desaparece y ya no hay forma de saber por dónde entró.

       NO DEPENDE DEL CARTEL, y eso es correcto: no deja cookie, no guarda nada
       en el navegador y no identifica a nadie — sólo se queda en memoria para
       pegarle la etiqueta al lead que esa persona entregue voluntariamente.
       Por eso va aquí arriba, antes de mirar qué contestó al cartel, y por eso
       funciona también para quien dijo «no, gracias» al píxel. El porqué
       entero está en `lib/campana.ts`.

       Va en este componente por una razón práctica: es el único que está
       montado en todas las páginas desde el primer momento. */
    recuerdaCampana();

    /* En una ventana privada o con las cookies bloqueadas, leer esto lanza. Y
       una web que revienta por no poder leer una preferencia de adorno es una
       web rota, así que se da por no contestado y ya está. */
    try {
      const v = localStorage.getItem(LLAVE);
      if (v === 'si' || v === 'no') setDecision(v);
    } catch {
      /* sin memoria: se preguntará otra vez */
    }
    setLeido(true);
  }, []);

  /* Sin identificadores no hay nada que cargar ni nada que preguntar. */
  if (!META && !GOOGLE) return null;

  const responder = (v: 'si' | 'no') => {
    setDecision(v);
    try {
      localStorage.setItem(LLAVE, v);
    } catch {
      /* si no se puede guardar, al menos vale para esta visita */
    }
  };

  return (
    <>
      {/* ------------------------------------------------- LAS ETIQUETAS
          `afterInteractive`: primero que la web sea usable, después la
          medición. Un píxel nunca puede retrasar lo que la persona ha venido a
          hacer. */}
      {decision === 'si' && META && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META}');fbq('track','PageView');`}
        </Script>
      )}

      {decision === 'si' && GOOGLE && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE}`} strategy="afterInteractive" />
          <Script id="google-tag" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('js',new Date());gtag('config','${GOOGLE}');`}
          </Script>
        </>
      )}

      {/* ------------------------------------------------------ EL CARTEL
          Abajo a la izquierda, que es la esquina que queda libre: a la derecha
          está el botón del chat y encima de él salen los susurros. */}
      {leido && decision === null && (
        <div className="cookies" role="dialog" aria-label="Uso de cookies de medición">
          {/* CORTO A PROPÓSITO, Y SIGUE DICIENDO LO QUE TIENE QUE DECIR.
              Antes eran cuatro líneas en un móvil y el cartel se comía el
              tercio de abajo de la pantalla, justo encima del formulario de
              la masterclass. La ley pide que se entienda PARA QUÉ son y que
              haya un sitio donde leer el detalle; no pide un párrafo. El
              para qué está en la primera frase, el detalle está en el
              enlace, y las dos respuestas siguen pesando lo mismo. */}
          <p className="cookies-txt">
            Cookies sólo para saber qué anuncios funcionan. No se te perfila.{' '}
            <Link href="/privacidad">Cómo tratamos tus datos</Link>.
          </p>
          <div className="cookies-botones">
            {/* Los dos botones iguales de tamaño y de peso, y el «no» primero.
                Si «aceptar» es grande y verde y «rechazar» es un enlace gris,
                el consentimiento no es libre — y entonces no vale. */}
            <button type="button" onClick={() => responder('no')} className="cookies-no">
              No, gracias
            </button>
            <button type="button" onClick={() => responder('si')} className="cookies-si">
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
