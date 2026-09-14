'use client';

/**
 * EL FORMULARIO DE CAPTACIÓN
 *
 * El mismo en toda la web: la escuela, los cursos, la sinergia. Sólo dice
 * «guardado» cuando el correo se ha guardado de verdad; si falla, lo dice y da
 * la dirección de Iris para que nadie se quede sin poder escribir.
 *
 * POR QUÉ TIENE ETIQUETAS Y NO SÓLO `placeholder`. El placeholder desaparece en
 * cuanto escribes la primera letra: quien se distrae a mitad ya no sabe qué
 * campo está rellenando, y un lector de pantalla no lo anuncia como nombre del
 * campo. Es el formulario que da de comer a esta web; que se pueda rellenar sin
 * ratón y sin ver la pantalla no es un extra.
 *
 * Y por qué es un <form> con un <button type="submit"> en vez de un <div> con
 * onClick: el <div> no recibe foco, así que se llegaba hasta el último campo con
 * el tabulador y ahí se acababa el viaje. Con el <form>, además, el Intro envía
 * desde cualquier campo sin que haya que programarlo campo por campo.
 */

import { useId, useState } from 'react';
import { sendLead } from '@/lib/sendLead';
import { CONTACTO } from '@/content/site';
import { medir } from '@/lib/medir';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function LeadForm({
  origen,
  detalle = '',
  cta,
  successTitle,
  successText,
  privacidad,
  pedirNombre = true,
  pedirWhatsapp = false,
  variant = 'dark',
  pagoUrl = '',
  pagoCta = 'Pagar y reservar mi plaza',
}: {
  origen: string;
  detalle?: string;
  cta: string;
  successTitle: string;
  successText: string;
  privacidad: string;
  pedirNombre?: boolean;
  pedirWhatsapp?: boolean;
  variant?: 'dark' | 'light';
  /**
   * Enlace de pago de Stripe. Si viene, después de guardar el correo el
   * formulario no termina: enseña el botón de pagar.
   *
   * POR QUÉ EL FORMULARIO SIGUE ESTANDO, Y NO SE MANDA A STRIPE DIRECTAMENTE.
   * Quien se va a Stripe y no termina de pagar —que es la mitad de la gente—
   * desaparece: Stripe no nos cuenta nada de quien no paga, así que ese correo
   * no llega a la plataforma de Iris y no se le puede escribir nunca más.
   * Guardando primero, el correo está a salvo pase lo que pase después, y si
   * alguien se queda a medio pago se le puede recordar.
   */
  pagoUrl?: string;
  pagoCta?: string;
}) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [err, setErr] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  // El mismo formulario sale varias veces en una página; los `id` tienen que ser
  // distintos o la etiqueta de uno acaba pinchando en el campo del otro.
  const uid = useId();

  const dark = variant === 'dark';
  /*
   * EL COLOR DE LOS CAMPOS SE HA IDO A LA HOJA DE ESTILOS, Y HACÍA FALTA.
   *
   * Aquí había un `style` en línea: sobre fondo oscuro, `background: var(--linea)`.
   * Dentro de un bloque `.vino`, `--linea` es blanco al 16 % sobre granate — o
   * sea, casi el granate. En la pantalla de la comunidad eso daba tres cuadros
   * del color de la pared, que es exactamente lo que Gerson señaló en la foto.
   *
   * Y lo peor no era el color: era que un `style` en línea GANA a cualquier
   * regla del CSS. Se podía escribir el arreglo en `globals.css` todas las veces
   * que se quisiera y no iba a aplicarse nunca. Por eso se va de aquí: los
   * colores de los campos se deciden en un sitio, y ese sitio es `.field-input`
   * y sus variantes por bloque.
   */

  const enviar = async () => {
    if (pedirNombre && nombre.trim().length < 2) return setErr('Escribe tu nombre.');
    if (!EMAIL_RE.test(email)) return setErr('Ese correo no parece válido.');
    setErr('');
    setSending(true);
    const partes = [detalle, whatsapp.trim() ? `WhatsApp: ${whatsapp.trim()}` : ''].filter(Boolean);
    const ok = await sendLead({ email, nombre, origen, detalle: partes.join(' · '), whatsapp: whatsapp.trim() });
    setSending(false);
    if (ok) {
      /* Un correo dejado no es una venta, pero sí es la señal más barata que
         tiene esta web: es por lo que puede pujar una campaña fría mientras no
         haya reservas suficientes para que Meta aprenda de ellas. */
      medir('lead', { origen });
      setDone(true);
    }
    else setErr(`No he podido guardarlo ahora mismo. Inténtalo en un minuto o escribe a ${CONTACTO.email}.`);
  };

  if (done) {
    return (
      /* `role="status"` para que quien no ve la pantalla se entere de que el
         correo ha entrado: si no, el formulario simplemente desaparece. */
      <div
        role="status"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
          border: `1px solid ${dark ? 'rgba(124,196,138,.4)' : 'rgba(47,93,80,.35)'}`,
          background: dark ? 'rgba(124,196,138,.08)' : '#EFF5F2',
          borderRadius: 16,
          padding: 20,
        }}
      >
        <span style={{ fontSize: 'var(--t-nota)', fontWeight: 600, color: dark ? '#7CC48A' : '#2F5D50' }}>{successTitle}</span>
        <span style={{ fontSize: 'var(--t-nota)', lineHeight: 1.55, color: 'var(--tx-2)' }}>{successText}</span>
        {/* El correo va con el enlace para que Stripe no lo vuelva a pedir. Y
            sobre todo para poder casar el pago con la persona: sin esto hay una
            lista de correos por un lado y una lista de cobros por otro, y
            cuadrarlas a mano es media hora cada semana. */}
        {pagoUrl && (
          <a
            href={`${pagoUrl}${pagoUrl.includes('?') ? '&' : '?'}prefilled_email=${encodeURIComponent(email)}`}
            data-mag
            className={`pill ${dark ? 'pill-gold' : 'pill-dark'}`}
            style={{ justifyContent: 'center', padding: '15px 20px', marginTop: 6 }}
          >
            <span>{pagoCta}</span>
            <span className="pill-arrow">→</span>
          </a>
        )}
      </div>
    );
  }

  const campo = (
    clave: string,
    etiqueta: string,
    tipo: 'text' | 'email' | 'tel',
    valor: string,
    pon: (v: string) => void,
    ph: string,
    autocompletar: string,
  ) => (
    <div className="lead-campo">
      <label className="rotulo-dato" htmlFor={`${uid}-${clave}`}>
        {etiqueta}
      </label>
      <input
        id={`${uid}-${clave}`}
        type={tipo}
        value={valor}
        placeholder={ph}
        autoComplete={autocompletar}
        onChange={(e) => {
          pon(e.target.value);
          setErr('');
        }}
        className="field-input"
      />
    </div>
  );

  return (
    <form
      className="lead-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!sending) enviar();
      }}
    >
      {pedirNombre && campo('nombre', 'Tu nombre', 'text', nombre, setNombre, 'Iris', 'name')}
      {campo('email', 'Tu correo', 'email', email, setEmail, 'tucorreo@ejemplo.com', 'email')}
      {/* «(opcional)» a secas es una invitación a saltárselo, y el WhatsApp es
          por donde Iris avisa de verdad. Decir PARA QUÉ sirve sube el relleno
          sin mentir sobre si hace falta.

          Pero decía «WhatsApp · si prefieres que te avise por ahí» EN
          VERSALITAS, y en un teléfono eso son dos renglones de mayúsculas
          espaciadas encima de una casilla — más letra en el rótulo que en el
          dato. Lo mismo en cuatro palabras. */}
      {pedirWhatsapp && campo('whatsapp', 'WhatsApp · te aviso antes', 'tel', whatsapp, setWhatsapp, '+34 600 00 00 00', 'tel')}

      <button
        type="submit"
        data-mag
        disabled={sending}
        className={`pill ${dark ? 'pill-gold' : 'pill-dark'}`}
        style={{ justifyContent: 'center', padding: '15px 20px', opacity: sending ? 0.68 : 1 }}
      >
        <span>{sending ? 'Guardando…' : cta}</span>
        <span className="pill-arrow">→</span>
      </button>

      {/* El error se anuncia solo. Antes aparecía en pantalla y punto: quien
          navega a ciegas se quedaba esperando a que pasara algo. */}
      <span role="alert" style={{ fontSize: 'var(--t-nota)', color: dark ? '#E08585' : '#A33B3B' }}>
        {err}
      </span>

      <span style={{ fontSize: 'var(--t-nota)', lineHeight: 1.6, color: 'var(--tx-3)' }}>{privacidad}</span>
    </form>
  );
}
