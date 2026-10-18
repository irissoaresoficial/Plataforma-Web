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
import { CONTACTO } from '@/content/site';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const TEXTO_CONSENTIMIENTO =
  'Acepto que Iris Soares guarde mi nombre y mi correo para avisarme de la fecha de esta masterclass y de los talleres que abra.';

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
    /* `role="status"` para que quien no ve la pantalla se entere de que ha
       entrado: si no, el formulario simplemente desaparece sin más. */
    return (
      <div className="casa-registro casa-registro-hecho" role="status">
        <span className="casa-registro-tic" aria-hidden="true">
          ✓
        </span>
        <h2 className="casa-registro-h">Apuntado.</h2>
        <p>
          Te escribo a <strong>{email.trim()}</strong> en cuanto haya fecha. Si
          no te llega nada, mira en «correo no deseado» y escríbeme a{' '}
          <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>.
        </p>
      </div>
    );
  }

  return (
    <form className="casa-registro" onSubmit={enviar} noValidate>
      <h2 className="casa-registro-h">Apúntate gratis</h2>
      <p className="casa-registro-p">
        Déjame tu nombre y tu correo y te escribo en cuanto haya fecha. La
        masterclass es gratuita.
      </p>

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
