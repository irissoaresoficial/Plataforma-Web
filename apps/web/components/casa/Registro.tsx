'use client';

/**
 * EL FORMULARIO DE LA MASTERCLASS.
 * ============================================================================
 *
 * Gerson: «la idea es sacar datos en ese curso, entonces haz bien el
 * formulario». Esto es lo que recibe el tráfico de la campaña de Meta, así
 * que es la pieza de la web que más se va a usar y la que no puede fallar.
 *
 * QUÉ PIDE, Y POR QUÉ TAN POCO.
 * Nombre y correo. El WhatsApp es opcional y lo dice. Cada campo de más en
 * un formulario frío cuesta gente que lo abandona a medias, y aquí no hace
 * falta nada más para avisar de una fecha. Pedir la fecha de nacimiento
 * «ya que estamos» sería recoger un dato que todavía no se usa, y eso el
 * RGPD lo llama minimización y lo prohíbe.
 *
 * EL CONSENTIMIENTO NO ES UNA CASILLA DE ADORNO.
 * Viene sin marcar, dice exactamente para qué se usa el correo, enlaza la
 * política de privacidad y sin él no se envía. Son los requisitos del
 * artículo 7 del RGPD, y el del consentimiento marcado de antemano es el
 * fallo que más multas se lleva en España.
 * Además se guarda la prueba: la fecha y la hora en que se marcó y el texto
 * literal que se aceptó, dentro de `detalle`. Un consentimiento que no se
 * puede demostrar es como no tenerlo (art. 7.1).
 *
 * LA TRAMPA PARA ROBOTS.
 * Un campo escondido que una persona nunca ve y un robot rellena siempre. Si
 * viene con algo, se finge que todo ha ido bien y no se manda nada. No lleva
 * `display:none` sino un recorte, para que un lector de pantalla tampoco lo
 * anuncie, y va con `tabIndex={-1}` y `autoComplete="off"`.
 *
 * LA SEÑAL PARA META.
 * Al entrar el lead se dispara `medir('lead')`, que es lo que ve la campaña
 * como conversión. Sólo se enciende si antes se aceptó la medición en el
 * cartel de cookies: el píxel ni se carga sin eso.
 */

import Link from 'next/link';
import { useId, useState } from 'react';
import { sendLead } from '@/lib/sendLead';
import { medir } from '@/lib/medir';
import { CONTACTO, MASTERCLASS } from '@/content/site';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* EL TEXTO QUE SE ACEPTA TIENE QUE SER LO QUE DE VERDAD PASA.
   Ahora, además del aviso de la fecha, la persona recibe un correo de
   confirmación con el enlace del grupo de WhatsApp. Eso es tratamiento de su
   correo, así que se nombra aquí: el consentimiento del artículo 7 del RGPD
   tiene que ser informado, y «informado» quiere decir que no haya ni un envío
   que no estuviera en la frase que marcó.
   Y se guarda literal dentro de `detalle` junto con la fecha y la hora, que es
   la prueba que exige el artículo 7.1. Si esta frase cambia, los
   consentimientos viejos siguen guardando la suya: cada uno conserva el texto
   que se aceptó ese día, no el de hoy. */
const TEXTO_CONSENTIMIENTO =
  'Acepto que Iris Soares guarde mi nombre y mi correo para mandarme la confirmación, avisarme de la fecha y contarme los talleres que abra.';

export default function Registro({ curso = 'Desórdenes Amorosos' }: { curso?: string }) {
  const id = useId();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [aceptado, setAceptado] = useState(false);
  const [trampa, setTrampa] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [hecho, setHecho] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim().length < 2) return setError('Escribe tu nombre.');
    if (!EMAIL_RE.test(email.trim())) return setError('Ese correo no parece válido.');
    if (!aceptado) return setError('Hace falta que aceptes para poder avisarte.');
    setError('');

    /* El robot se va por aquí creyendo que ha funcionado. */
    if (trampa) return setHecho(true);

    setEnviando(true);
    const prueba = [
      `Masterclass: ${curso}`,
      whatsapp.trim() ? `WhatsApp: ${whatsapp.trim()}` : '',
      `Consentimiento: ${new Date().toISOString()} — «${TEXTO_CONSENTIMIENTO}»`,
    ]
      .filter(Boolean)
      .join(' · ');

    const ok = await sendLead({
      email: email.trim(),
      nombre: nombre.trim(),
      /* `curso` es uno de los tres orígenes que el servidor conoce. De qué
         curso se trata va en `detalle`, que es texto libre: está explicado
         en `LEAD_SOURCES`, en lib/booking.ts. */
      origen: 'curso',
      detalle: prueba,
      whatsapp: whatsapp.trim(),
    });
    setEnviando(false);

    if (ok) {
      medir('lead', { origen: 'masterclass' });
      setHecho(true);
    } else {
      setError(`No he podido guardarlo ahora mismo. Inténtalo en un minuto o escribe a ${CONTACTO.email}.`);
    }
  };

  if (hecho) {
    /*
     * LA PANTALLA DE GRACIAS: UN PASE, NO UN AVISO.
     *
     * Gerson pidió primero que existiera —«si yo dejo los datos, eso tiene que
     * hacer un gracias y debe haber un link de un grupo de WhatsApp»— y
     * después, el 19 de octubre, que estuviera mejor: «hay que mejorar este
     * mensaje, que sea más bonito y más contraste».
     *
     * Era una caja blanca con un tic, un titular y tres párrafos grises del
     * mismo tamaño. Cumplía la norma de contraste por los pelos y no se le
     * notaba por ninguna parte que acababa de pasar algo bueno.
     *
     * Ahora está montada como lo que es: EL PASE DE UNA PLAZA. Cabecera
     * granate con el sello y «PLAZA CONFIRMADA» en dorado, un troquelado
     * —punteado y dos muescas, como el corte de una entrada— y debajo lo que
     * hay que hacer. No es un adorno porque cambia lo que se entiende: una
     * caja blanca es un mensaje del sistema; un pase es algo que tienes.
     *
     * Y EL CONTRASTE SUBE DE VERDAD, no de palabra:
     *   · la cabecera es granate con blanco encima, que es lo más separado que
     *     hay en toda la paleta;
     *   · el párrafo que importa pasa del gris a la tinta de la casa;
     *   · el botón del grupo ocupa el ancho entero y es el único de la caja,
     *     así que no compite con nada (MARCA.md §5);
     *   · y la letra pequeña se queda pequeña, que es su sitio — lo que no
     *     puede es ser del mismo tamaño que lo importante, que era el fallo.
     *
     * `role="status"` para que quien no ve la pantalla se entere de que ha
     * entrado: si no, el formulario simplemente desaparece sin más.
     */
    const nombrePila = nombre.trim().split(/\s+/)[0];

    return (
      <div className="casa-registro casa-gracias" role="status">
        <div className="casa-gracias-alto">
          <span className="casa-gracias-tic" aria-hidden="true">
            {/* Un visto dibujado, no el carácter «✓»: el carácter cambia de
                forma según la letra que tenga el sistema y en algunas sale
                como una cruz fina. Dos trazos son dos trazos en todas. */}
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m4 12.5 5.5 5.5L20 6.5" />
            </svg>
          </span>
          <span className="casa-gracias-rotulo">Plaza confirmada</span>
        </div>

        {/* EL TROQUELADO. Dos muescas y una línea de puntos: es el corte por
            donde se parte una entrada, y es lo que hace que la caja se lea
            como un pase y no como un cuadro blanco. Decorativo, así que no lo
            anuncia un lector de pantalla. */}
        <div className="casa-gracias-corte" aria-hidden="true">
          <i />
          <span />
          <i />
        </div>

        <div className="casa-gracias-bajo">
          <h2 className="casa-gracias-h">
            Gracias{nombrePila ? `, ${nombrePila}` : ''}.
          </h2>
          <p className="casa-gracias-p">
            Ya tienes tu plaza. Te he mandado la confirmación a{' '}
            <strong>{email.trim()}</strong>.
          </p>

          {CONTACTO.grupo ? (
            <>
              {/* EL GRUPO. Es lo único que se le pide hacer ahora, así que va
                  solo, a todo el ancho y con el peso del botón principal: dos
                  acciones aquí serían dos dudas (MARCA.md §5).
                  `rel="noreferrer"` además de `noopener` porque esto sale de
                  la web hacia fuera. */}
              <p className="casa-gracias-paso">
                Es {MASTERCLASS.cuando} ({MASTERCLASS.zona}). Ahora entra al
                grupo: ahí mando el enlace el día de la clase y contesto dudas.
              </p>
              <a
                className="casa-gracias-boton casa-brillo"
                href={CONTACTO.grupo}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="casa-gracias-disco" aria-hidden="true">
                  {/* Un bocadillo de conversación. Dos trazos, como los demás
                      iconos de la casa: la marca de WhatsApp es suya y no se
                      dibuja aquí a ojo. La palabra ya dice de qué grupo es. */}
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-3.9-.9L3 21l2-4.1A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" />
                  </svg>
                </span>
                Entrar al grupo de WhatsApp
              </a>
              <p className="casa-gracias-letra">
                Puedes salirte cuando quieras. Si no te llega el correo, mira en
                «correo no deseado» y escríbeme a{' '}
                <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>.
              </p>
            </>
          ) : (
            /* Sin enlace de grupo no se inventa uno ni se promete un botón que
               no está: se dice lo que sí va a pasar. En cuanto haya invitación
               en `CONTACTO.grupo`, el botón de arriba sale solo. */
            <p className="casa-gracias-letra">
              Es {MASTERCLASS.cuando} ({MASTERCLASS.zona}). En ese correo va
              también el enlace del grupo de WhatsApp de la masterclass, que es
              donde mando el enlace el día de la clase y contesto dudas. Si no
              te llega, mira en «correo no deseado» y escríbeme a{' '}
              <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <form className="casa-registro" onSubmit={enviar} noValidate>
      <h2 className="casa-registro-h">Apúntate gratis</h2>
      {/* UNA LÍNEA Y NO TRES. Decía «déjame tu nombre y tu correo y te
          escribo en cuanto haya fecha, la masterclass es gratuita», y de ahí
          «tu nombre y tu correo» lo dicen las dos casillas de debajo y «es
          gratuita» lo dicen el rótulo de arriba y el botón. Eran cincuenta
          píxeles repitiendo lo que ya está a la vista, y en esta caja cada
          píxel que sobra empuja el botón de enviar fuera de la pantalla. */}
      {/* YA HAY FECHA, así que aquí va la fecha. Esta línea decía «te escribo
          en cuanto haya fecha», que era verdad mientras no la hubiera y era lo
          único honrado que se podía decir. Ahora lo honrado y lo que más
          convierte coinciden: una fecha concreta quita la duda de «¿y esto
          cuándo es?», que es la que frena a mitad del formulario. */}
      <p className="casa-registro-p">{MASTERCLASS.cuando}.</p>

      <label className="casa-campo" htmlFor={`${id}-n`}>
        <span>Tu nombre</span>
        <input
          id={`${id}-n`}
          name="nombre"
          type="text"
          autoComplete="given-name"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </label>

      <label className="casa-campo" htmlFor={`${id}-e`}>
        <span>Tu correo</span>
        <input
          id={`${id}-e`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label className="casa-campo" htmlFor={`${id}-w`}>
        <span>
          WhatsApp <em>(opcional)</em>
        </span>
        <input
          id={`${id}-w`}
          name="whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
        />
      </label>

      {/* La trampa. Ni se ve ni la anuncia un lector de pantalla ni la
          alcanza el tabulador; un robot la rellena igual. */}
      <div className="casa-oculto" aria-hidden="true">
        <label htmlFor={`${id}-t`}>No rellenes esto</label>
        <input
          id={`${id}-t`}
          name="apellidos"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={trampa}
          onChange={(e) => setTrampa(e.target.value)}
        />
      </div>

      <label className="casa-acepto" htmlFor={`${id}-c`}>
        <input
          id={`${id}-c`}
          type="checkbox"
          checked={aceptado}
          onChange={(e) => setAceptado(e.target.checked)}
        />
        <span>
          {TEXTO_CONSENTIMIENTO} Puedo borrarme cuando quiera.{' '}
          <Link href="/privacidad">Cómo trato tus datos</Link>.
        </span>
      </label>

      {error && (
        <p className="casa-registro-mal" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="casa-registro-boton casa-brillo" disabled={enviando}>
        {enviando ? 'Un segundo…' : 'Quiero mi plaza'}
      </button>
    </form>
  );
}
