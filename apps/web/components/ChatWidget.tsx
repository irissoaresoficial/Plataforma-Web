'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Image from 'next/image';
import { useLang } from '@/lib/i18n';
import { DEFAULT_HOURS } from '@/lib/booking';
import { LOGO_COLOR } from '@/content/site';
import { caminoDeVida, SENTIDO, SENTIDO_DEUDA } from '@/lib/numerologia';

/*
 * EL AGENTE HACE NUMEROLOGÍA, NO RELLENA UN FORMULARIO
 *
 * Antes pedía la fecha de nacimiento «porque Iris la necesita» y pasaba a la
 * siguiente pregunta. Entra una fecha y no sale nada: eso es un formulario con
 * globos de chat, y la persona lo nota a la segunda pregunta.
 *
 * Ahora, en cuanto la da, el agente hace delante de ella la misma cuenta que
 * hace Iris —el camino de vida— y le dice su número y qué pide ese número. Sale
 * del mismo motor que la portada y que el estudio de sinergia, así que no puede
 * decir una cosa aquí y otra allí. Es lo que convierte la conversación en una
 * consulta: se ha llevado algo antes de que se le pida nada.
 */

/** Los meses escritos con letra, en los tres idiomas de la web. */
const MESES: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  janeiro: 1, fevereiro: 2, março: 3, marco: 3, maio: 5, junho: 6, julho: 7, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function arma(dia: number, mes: number, anio: number): string | null {
  if (anio < 100) anio += anio > 30 ? 1900 : 2000; // «96» es 1996; «05», 2005
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || anio < 1900 || anio > new Date().getFullYear()) return null;
  const f = new Date(anio, mes - 1, dia);
  if (f.getDate() !== dia || f.getMonth() !== mes - 1) return null; // 31 de febrero y compañía
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

/**
 * La fecha, como la escriba: «29 marzo 1996», «29/3/96», «29-03-1996»,
 * «1996-03-29». Se pide en un chat; nadie va a respetar un formato. Si no hay
 * manera de leerla devuelve null, y entonces el agente sigue sin la cuenta en
 * vez de soltar un número que no es.
 */
export function leerFecha(texto: string): string | null {
  const s = (texto || '').toLowerCase().trim();

  const conLetra = s.match(/(\d{1,2})\s*(?:de\s+)?([a-zà-ÿ]+)\s*(?:de\s+)?(\d{2,4})/);
  if (conLetra) {
    const mes = MESES[conLetra[2]];
    if (mes) return arma(Number(conLetra[1]), mes, Number(conLetra[3]));
  }

  const n = s.match(/(\d{1,4})\D+(\d{1,2})\D+(\d{1,4})/);
  if (!n) return null;
  const [a, b, c] = [Number(n[1]), Number(n[2]), Number(n[3])];
  // Con cuatro cifras delante viene al revés: 1996-03-29.
  return a > 31 ? arma(c, b, a) : arma(a, b, c);
}

/** Lo que dice el agente al ver la fecha. Numerología de verdad, no relleno. */
export function lecturaDe(fechaISO: string): string | null {
  const c = caminoDeVida(fechaISO);
  const s = SENTIDO[c.valor];
  if (!s) return null;

  const cabecera =
    c.valor === 11 || c.valor === 22 || c.valor === 33
      ? `Tu camino de vida es un ${c.valor}, y es de los que no se reducen: un maestro.`
      : `Tu camino de vida es un ${c.valor}.`;

  const deuda = c.deuda ? ` Y llega por el ${c.deuda}. ${SENTIDO_DEUDA[c.deuda]}` : '';
  return `${cabecera} ${s.clave}: ${s.frase}.${deuda}`;
}

type Msg = { from: 'bot' | 'user'; text: string };
type Escribiendo = { texto: string; n: number };

/** Parte el texto en palabras conservando el espacio que va detrás de cada una. */
const partir = (s: string) => s.match(/\S+\s*/g) || [];
type Data = { nombre?: string; fecha?: string; motivo?: string; dia?: string; diaISO?: string; hora?: string; email?: string };
type Availability = Record<string, string[]>;

export type ChatWidgetHandle = { open: () => void };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ChatWidget = forwardRef<ChatWidgetHandle>(function ChatWidget(_props, ref) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [escrito, setEscrito] = useState<Escribiendo | null>(null);
  const [data, setData] = useState<Data>({});
  const [done, setDone] = useState(false);
  const [calOffset, setCalOffset] = useState(0);
  const [avail, setAvail] = useState<Availability | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // React 19 ya no deja `useRef` sin valor inicial: hay que decir que empieza
  // vacío, en vez de dejarlo sobreentendido.
  const botTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /*
   * LOS PATRONES.
   *
   * «¿Qué es eso que se te repite?» con un cuadro de texto vacío es la pregunta
   * más difícil que se le puede hacer a alguien que acaba de entrar: si supiera
   * decirlo en una línea no necesitaría la sesión. Y en un móvil, escribir es
   * justo donde se cae la mitad de la gente.
   *
   * Están dichos como los dice quien lo vive, no como los nombra el manual —una
   * persona no escribe «lealtad familiar invisible», escribe «me pasa lo mismo
   * que a mi madre»—, y cada uno cae en un sitio del oficio: el 6 y la casa, el
   * 8 y el dinero, el 9 y lo que se hereda, el 4 y lo que no se cierra. Iris los
   * recibe ya clasificados, que es lo que le sirve para preparar la sesión.
   *
   * Y sigue estando el cuadro de texto, porque a quien tenga otra cosa que decir
   * no se le puede cerrar la puerta.
   */
  const PATRONES = [
    'Repito la misma relación',
    'El dinero entra y se va',
    'Me pasa lo mismo que a mi madre',
    'Empiezo cosas y no las cierro',
    'Cargo con algo que no es mío',
    'Hay una fecha que vuelve en mi familia',
  ];

  const flow = [
    { key: 'nombre' as const, ask: t.ch_a1, ph: t.ch_p1 },
    { key: 'fecha' as const, ask: t.ch_a2, ph: t.ch_p2, first: true },
    { key: 'motivo' as const, ask: t.ch_a3, ph: t.ch_p3, sugerencias: PATRONES },
    { key: 'dia' as const, ask: t.ch_a4, calendar: true },
    { key: 'hora' as const, ask: t.ch_a5, options: true },
    { key: 'email' as const, ask: t.ch_a6, ph: t.ch_p6 },
  ];
  const cur = flow[step];

  const scrollDown = () => {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const b = bodyRef.current;
        if (b) b.scrollTop = b.scrollHeight;
      })
    );
  };

  useEffect(() => {
    scrollDown();
  }, [msgs, typing, escrito]);

  useEffect(() => () => clearTimeout(botTimer.current), []);

  /*
   * EL PANEL SE CIERRA CON ESCAPE Y EL FOCO NO SE ESCAPA DE ÉL.
   *
   * Sin esto, quien no usa ratón entraba y se quedaba dentro: podía escribir su
   * nombre y a partir de ahí no podía elegir día, ni enviar, ni salir. Y con el
   * tabulador el foco se iba detrás del panel, a cosas tapadas que no se ven.
   *
   * La trampa de foco es lo que se espera de cualquier ventana que se abre
   * encima: mientras esté abierta, el tabulador da vueltas dentro.
   */
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const p = panelRef.current;
      if (!p) return;
      const focos = p.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focos.length) return;
      const primero = focos[0];
      const ultimo = focos[focos.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener('keydown', alPulsar);
    return () => document.removeEventListener('keydown', alPulsar);
  }, [open]);

  /**
   * El bot piensa un momento (los tres puntos) y después escribe: las palabras
   * van apareciendo una a una en vez de soltar el mensaje entero de golpe.
   * `escrito` es lo que se está tecleando; al acabar pasa a la lista de mensajes.
   *
   * DOS MENSAJES SEGUIDOS SE PONEN EN COLA, no se calculan por reloj. Cuando el
   * agente dice el camino de vida y después vuelve a preguntar, hacen falta dos
   * turnos; encadenarlos con un setTimeout «a ojo» funciona con la frase corta y
   * se pisa con la larga —una fecha con deuda kármica añade veinte palabras—, y
   * lo que se ve entonces es media frase machacada por la siguiente. La cola no
   * necesita adivinar cuánto tarda nada: el siguiente arranca cuando el anterior
   * ha terminado de verdad.
   */
  const [cola, setCola] = useState<{ texto: string; delay: number }[]>([]);
  /** Lo que el agente va a decir en cuanto termine de «pensar». */
  const pendiente = useRef<string | null>(null);

  const arranca = (text: string, delay: number) => {
    setTyping(true);
    pendiente.current = text;
    clearTimeout(botTimer.current);
    botTimer.current = setTimeout(() => {
      setTyping(false);
      pendiente.current = null;
      setEscrito({ texto: text, n: 0 });
    }, delay);
  };

  /**
   * El agente termina de hablar de golpe.
   *
   * Hacía falta porque el envío estaba bloqueado mientras el agente escribía: si
   * contestabas rápido —que es lo normal cuando la respuesta es tu nombre— le
   * dabas a enviar y no pasaba nada. Tu mensaje no se perdía, se quedaba en el
   * cuadro, pero desde fuera eso es un botón roto, y en un móvil es donde se
   * abandona la reserva.
   *
   * Ahora contestar interrumpe: lo que el agente estuviera diciendo se completa
   * al instante y tu mensaje entra detrás. Es lo que hace cualquier chat.
   */
  const adelantar = () => {
    clearTimeout(botTimer.current);
    if (escrito) {
      setMsgs((m) => [...m, { from: 'bot', text: escrito.texto }]);
      setEscrito(null);
    } else if (pendiente.current) {
      setMsgs((m) => [...m, { from: 'bot', text: pendiente.current as string }]);
    }
    pendiente.current = null;
    setTyping(false);
    /* Y lo que quedara en cola se descarta. Si ya has contestado, que el agente
       te suelte después la pregunta que ibas a responder es peor que no
       decirla. */
    setCola([]);
  };

  /** Uno o varios mensajes seguidos, en orden. */
  const bot = (texto: string | string[], delay = 700) => {
    const partes = Array.isArray(texto) ? texto : [texto];
    if (!partes.length) return;
    arranca(partes[0], delay);
    if (partes.length > 1) setCola(partes.slice(1).map((p) => ({ texto: p, delay: 420 })));
  };

  useEffect(() => {
    if (!escrito) return;

    const total = partir(escrito.texto).length;
    if (escrito.n >= total) {
      // Ya está escrito entero: se guarda como mensaje y se libera la entrada.
      const fin = setTimeout(() => {
        setMsgs((m) => [...m, { from: 'bot', text: escrito.texto }]);
        setEscrito(null);
      }, 260);
      return () => clearTimeout(fin);
    }

    // Un respiro más largo después de un punto o una coma: se lee como habla.
    const ultima = partir(escrito.texto)[escrito.n] || '';
    const pausa = /[.!?]$/.test(ultima.trim()) ? 260 : /[,;:]$/.test(ultima.trim()) ? 150 : 0;
    const paso = setTimeout(() => setEscrito({ ...escrito, n: escrito.n + 1 }), 46 + pausa);
    return () => clearTimeout(paso);
  }, [escrito]);

  // En cuanto no hay nada escribiéndose, sale el siguiente de la cola.
  useEffect(() => {
    if (escrito || typing || !cola.length) return;
    const [siguiente, ...resto] = cola;
    setCola(resto);
    arranca(siguiente.texto, siguiente.delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escrito, typing, cola]);

  const openChat = () => {
    setOpen(true);
    if (!msgs.length) bot(flow[0].ask, 420);
    // Huecos reales de la agenda de Iris. Si no contesta, se usa la plantilla por defecto.
    if (!avail) {
      fetch('/api/availability')
        .then((r) => r.json())
        .then((d) => {
          if (!d?.ok || !Array.isArray(d.days)) return;
          const map: Availability = {};
          d.days.forEach((day: { iso: string; hours: string[] }) => (map[day.iso] = day.hours));
          setAvail(map);
        })
        .catch(() => {});
    }
    setTimeout(() => inputRef.current?.focus(), 480);
  };

  useImperativeHandle(ref, () => ({ open: openChat }));

  const sendBooking = async (booking: Data) => {
    setTyping(true);
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...booking, lang }),
      });
      const out = await res.json().catch(() => null);
      setTyping(false);

      if (out?.ok) {
        bot(t.ch_sum.replace('{d}', booking.dia || '').replace('{h}', booking.hora || ''), 260);
        setTimeout(() => bot(t.ch_conf.replace('{e}', booking.email || ''), 500), 2600);
        return;
      }

      // A quien reserva no le sirve saber qué variable falta, pero a quien lleva
      // la web sí: queda en la consola del navegador y en /api/diagnostico.
      console.warn('[reserva] no se ha podido guardar. Motivo:', out?.reason ?? res.status, '— abre /api/diagnostico');
      bot(out?.reason === 'taken' ? t.ch_taken : t.ch_err, 260);
      if (out?.reason === 'taken') {
        // El hueco se ocupó mientras escribía: se vuelve al calendario en lugar de dejarlo colgado.
        setData((d) => ({ ...d, dia: undefined, diaISO: undefined, hora: undefined }));
        setStep(3);
        setDone(false);
      }
    } catch {
      setTyping(false);
      bot(t.ch_err, 260);
    }
  };

  const submit = (raw: string, meta?: Partial<Data>) => {
    const val = (raw || '').trim();
    if (!val || done) return;
    // Si el agente estaba hablando, se le corta: no se pierde ni una respuesta.
    if (typing || escrito) adelantar();

    if (cur.key === 'email' && !EMAIL_RE.test(val)) {
      setMsgs((m) => [...m, { from: 'user', text: val }]);
      setDraft('');
      bot(t.wl_err, 500);
      return;
    }

    const next = flow[step + 1] || null;
    const newData = { ...data, ...meta, [cur.key]: val };
    setMsgs((m) => [...m, { from: 'user', text: val }]);
    setDraft('');
    setData(newData);
    setStep(step + 1);

    if (!next) {
      setDone(true);
      setTimeout(() => sendBooking(newData), 700);
      return;
    }

    /*
     * LA CUENTA, EN MEDIO DE LA CONVERSACIÓN.
     *
     * Con la fecha en la mano el agente para un segundo, hace el camino de vida
     * y lo dice, y sólo después sigue preguntando. Dos mensajes seguidos, con la
     * pausa del segundo calculada para que el primero haya terminado de
     * escribirse: si se lanzan a la vez, el que llega segundo pisa al primero.
     *
     * Si la fecha no se ha podido leer no se inventa nada: se sigue como antes.
     */
    if (cur.key === 'fecha') {
      const iso = leerFecha(val);
      const lectura = iso && lecturaDe(iso);
      if (lectura) {
        bot([lectura, next.ask], 820);
        return;
      }
    }

    bot(next.ask.replace('{n}', next.first ? val.split(' ')[0] : val), 740);
  };

  // Calendario
  const loc = lang === 'en' ? 'en-GB' : lang === 'pt' ? 'pt-PT' : 'es-ES';
  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + calOffset);
  const calMonth = base.toLocaleDateString(loc, { month: 'long', year: 'numeric' });
  const calWeekdays = lang === 'pt' ? ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'] : lang === 'en' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDow = (base.getDay() + 6) % 7;
  const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, '0');

  const cells: { label: string; value: string; iso: string; free: boolean; sel: boolean }[] = [];
  for (let i = 0; i < firstDow; i++) cells.push({ label: '', value: '', iso: '', free: false, sel: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(base.getFullYear(), base.getMonth(), d);
    const iso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const dow = date.getDay();
    // Con agenda conectada mandan los huecos reales; sin ella, laborables a partir de mañana.
    const free = avail ? !!avail[iso]?.length : date > today && dow !== 0 && dow !== 6;
    const label = date.toLocaleDateString(loc, { weekday: 'short', day: 'numeric', month: 'short' });
    cells.push({ label: String(d), value: free ? label : '', iso, free, sel: data.diaISO === iso });
  }

  const ocupado = typing || Boolean(escrito);
  const calOn = !ocupado && cur?.calendar;
  const hourOptions = data.diaISO && avail?.[data.diaISO] ? avail[data.diaISO] : DEFAULT_HOURS;
  const opts = !ocupado && cur?.options ? hourOptions : [];
  const typable = !done && cur && !cur.options && !cur.calendar;

  const bubbleWrap = (me: boolean): React.CSSProperties => ({ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start' });
  const bubbleStyle = (me: boolean): React.CSSProperties => ({
    maxWidth: '82%',
    fontSize: 15,
    lineHeight: 1.5,
    padding: '11px 14px',
    borderRadius: me ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
    background: me ? 'var(--vino)' : 'var(--arena)',
    color: me ? '#FFFFFF' : 'var(--tx)',
    border: me ? 'none' : '1px solid var(--linea)',
  });

  return (
    <>
      <button
        type="button"
        id="chat-launcher"
        className="vino"
        onClick={openChat}
        aria-label={t.cbook || 'Reservar una sesión'}
        data-mag
        data-cur-label={t.cbook}
        style={{
          position: 'fixed',
          zIndex: 139,
          right: 'clamp(10px,2vw,24px)',
          bottom: 'clamp(10px,2vw,24px)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--vino)',
          color: 'var(--tx)',
          border: '1px solid var(--linea-2)',
          borderRadius: 100,
          padding: '8px 10px 8px 8px',
          cursor: 'pointer',
          boxShadow: '0 14px 34px rgba(34,29,31,.28)',
          transition: 'opacity .35s ease,transform .45s cubic-bezier(.16,1,.3,1),border-color .4s ease',
          opacity: open ? 0 : 1,
          pointerEvents: open ? 'none' : 'auto',
          transform: `translateY(${open ? 10 : 0}px)`,
        }}
      >
        <div style={{ position: 'relative', width: 38, height: 38, flexShrink: 0 }}>
          <div
            style={{
              position: 'absolute',
              inset: -5,
              borderRadius: '50%',
              border: '1px solid rgba(200,155,74,.55)',
              animation: 'pulseRing 2.6s ease-out infinite',
            }}
          />
          <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', background: 'var(--superficie)', border: '1px solid rgba(200,155,74,.5)' }}>
            <Image src="/images/iris.jpg" alt="Iris" width={38} height={38} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 18%', display: 'block' }} />
          </div>
          <span style={{ position: 'absolute', right: -1, bottom: -1, width: 11, height: 11, borderRadius: '50%', background: '#7CC48A', border: '2px solid var(--bg)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'left' }}>
          <span style={{ fontSize: 14, fontWeight: 'var(--peso-fino)', letterSpacing: '-.01em', whiteSpace: 'nowrap' }}>{t.book}</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--tx-2)', whiteSpace: 'nowrap' }}>{t.ch_sub}</span>
        </div>
        <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--boton)', color: 'var(--boton-tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'var(--peso-medio)', flexShrink: 0 }}>
          →
        </span>
      </button>

      {/* Una ventana que se abre encima tiene que decir que lo es: `dialog`
          para que un lector de pantalla la anuncie, `aria-modal` para que se
          entienda que lo de detrás está en pausa, y `aria-hidden` cuando está
          cerrada para que su contenido no aparezca leyendo el resto. */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.ch_title}
        aria-hidden={!open}
        style={{
          position: 'fixed',
          zIndex: 140,
          right: 'clamp(10px,2vw,24px)',
          bottom: 'clamp(10px,2vw,24px)',
          width: 'min(calc(100vw - 20px),376px)',
          height: 'min(calc(100vh - 20px),560px)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg)',
          border: '1px solid var(--linea)',
          borderRadius: 22,
          boxShadow: '0 30px 80px rgba(0,0,0,.55)',
          overflow: 'hidden',
          transformOrigin: 'bottom right',
          transition: 'opacity .4s cubic-bezier(.16,1,.3,1),transform .55s cubic-bezier(.16,1,.3,1),visibility .4s',
          opacity: open ? 1 : 0,
          visibility: open ? 'visible' : 'hidden',
          transform: open ? 'translateY(0) scale(1)' : 'translateY(18px) scale(.95)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '15px 17px', borderBottom: '1px solid var(--linea)', flexShrink: 0 }}>
          {/* El sello de la escuela: quien escribe no es Iris, es su casa. */}
          <div style={{ width: 40, height: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image src={LOGO_COLOR} alt="" width={40} height={40} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{t.ch_title}</span>
            <span style={{ fontSize: 11, color: 'var(--tx-3)' }}>{done ? t.ch_done : t.ch_sub}</span>
          </div>
          <span style={{ fontSize: 'var(--rotulo-tam)', fontWeight: 'var(--rotulo-peso)', letterSpacing: 'var(--rotulo-esp)', textTransform: 'uppercase', color: 'var(--acento)', border: '1px solid rgba(200,155,74,.4)', borderRadius: 100, padding: '4px 8px', flexShrink: 0 }}>
            IA
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
            className="chat-cerrar"
          >
            ×
          </button>
        </div>

        {/* Los mensajes se apoyan abajo: si se apilan arriba queda un vacío
            entre la conversación y el campo de escribir, y se ve roto. */}
        <div id="chat-body" ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 9 }}>
          {msgs.map((m, i) => (
            <div key={i} style={bubbleWrap(m.from === 'user')}>
              {/* Lo que escribe la persona entra con su fade; lo del bot ya se
                  animó palabra a palabra mientras se tecleaba. */}
              <div className={m.from === 'user' ? 'burbuja-in' : undefined} style={bubbleStyle(m.from === 'user')}>
                {m.text}
              </div>
            </div>
          ))}
          {escrito && (
            <div style={bubbleWrap(false)}>
              <div className="burbuja-in" style={bubbleStyle(false)}>
                {partir(escrito.texto)
                  .slice(0, escrito.n)
                  .map((palabra, i) => (
                    <span key={i} className="palabra">
                      {palabra}
                    </span>
                  ))}
                {escrito.n < partir(escrito.texto).length && <span className="cursor-chat" />}
              </div>
            </div>
          )}
          {typing && (
            <div className="burbuja-in" style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '13px 15px', background: 'var(--linea)', borderRadius: '14px 14px 14px 4px', alignSelf: 'flex-start' }}>
              <span className="punto" />
              <span className="punto" />
              <span className="punto" />
            </div>
          )}
        </div>

        {calOn && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px 12px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <button type="button" onClick={() => setCalOffset((o) => Math.max(0, o - 1))} aria-label="Mes anterior" className="chat-mes">
                ‹
              </button>
              <span style={{ fontSize: 13, fontWeight: 'var(--peso-fino)', letterSpacing: '-.01em', textTransform: 'capitalize' }}>{calMonth}</span>
              <button type="button" onClick={() => setCalOffset((o) => Math.min(6, o + 1))} aria-label="Mes siguiente" className="chat-mes">
                ›
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
              {calWeekdays.map((w, i) => (
                <span key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, letterSpacing: '.06em', color: 'var(--tx-4)' }}>
                  {w}
                </span>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
              {/* Un botón de verdad, y de 44 px de alto: medía 30 y son el paso
                  obligado para reservar, apretados en siete columnas. Los días
                  sin hueco van deshabilitados, no invisibles: así el calendario
                  se sigue entendiendo. */}
              {cells.map((d, i) => (
                <button
                  type="button"
                  key={i}
                  disabled={!d.free}
                  aria-label={d.value ? `${d.label} de ${calMonth}` : undefined}
                  aria-current={d.sel ? 'date' : undefined}
                  onClick={() => d.value && submit(d.value, { diaISO: d.iso })}
                  className="chat-dia"
                  style={{
                    visibility: d.label ? 'visible' : 'hidden',
                    color: d.free ? (d.sel ? '#FFFFFF' : 'var(--tx)') : 'var(--tx-4)',
                    background: d.free ? (d.sel ? 'var(--acento)' : 'var(--linea)') : 'transparent',
                    border: d.free ? `1px solid ${d.sel ? 'var(--acento)' : 'var(--linea)'}` : '1px solid transparent',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 10, lineHeight: 1.5, color: 'var(--tx-3)' }}>{t.ch_cal}</span>
          </div>
        )}

        {opts.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '0 16px 12px', flexShrink: 0 }}>
            {opts.map((o) => (
              <button type="button" key={o} onClick={() => submit(o)} className="chat-hora">
                {o}
              </button>
            ))}
          </div>
        )}

        {/* Los patrones. Se pulsa uno y ya está contestado; el cuadro de texto
            sigue abajo para quien tenga otra cosa que decir. */}
        {!ocupado && cur?.sugerencias && (
          <div className="chat-patrones">
            {cur.sugerencias.map((s) => (
              <button type="button" key={s} onClick={() => submit(s)} className="chat-patron">
                {s}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: typable ? 'flex' : 'none', alignItems: 'center', gap: 9, margin: '0 16px 12px', padding: '7px 7px 7px 14px', border: '1px solid var(--linea-2)', borderRadius: 100, flexShrink: 0 }}>
          <input
            id="chat-input"
            ref={inputRef}
            type="text"
            value={draft}
            aria-label={cur?.ask || 'Tu respuesta'}
            placeholder={cur?.ph || '…'}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submit(draft);
              }
            }}
            style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: 'var(--tx)', padding: '6px 0' }}
          />
          <button type="button" onClick={() => submit(draft)} aria-label="Enviar" className="chat-enviar">
            →
          </button>
        </div>
        <div style={{ padding: '0 17px 13px', fontSize: 10, lineHeight: 1.6, color: 'var(--tx-4)' }}>{t.ch_priv}</div>
      </div>
    </>
  );
});

export default ChatWidget;
