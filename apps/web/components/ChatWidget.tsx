'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Image from 'next/image';
import { useLang } from '@/lib/i18n';
import { DEFAULT_HOURS } from '@/lib/booking';
import { LOGO_COLOR } from '@/content/site';

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

  const flow = [
    { key: 'nombre' as const, ask: t.ch_a1, ph: t.ch_p1 },
    { key: 'fecha' as const, ask: t.ch_a2, ph: t.ch_p2, first: true },
    { key: 'motivo' as const, ask: t.ch_a3, ph: t.ch_p3 },
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

  /**
   * El bot piensa un momento (los tres puntos) y después escribe: las palabras
   * van apareciendo una a una en vez de soltar el mensaje entero de golpe.
   * `escrito` es lo que se está tecleando; al acabar pasa a la lista de mensajes.
   */
  const bot = (text: string, delay = 700) => {
    setTyping(true);
    botTimer.current = setTimeout(() => {
      setTyping(false);
      setEscrito({ texto: text, n: 0 });
    }, delay);
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
    if (!val || typing || escrito || done) return;

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

    if (next) {
      bot(next.ask.replace('{n}', next.first ? val.split(' ')[0] : val), 740);
    } else {
      setDone(true);
      setTimeout(() => sendBooking(newData), 700);
    }
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
      <div
        id="chat-launcher"
        className="vino"
        onClick={openChat}
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
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-.01em', whiteSpace: 'nowrap' }}>{t.book}</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--tx-2)', whiteSpace: 'nowrap' }}>{t.ch_sub}</span>
        </div>
        <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--boton)', color: 'var(--boton-tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
          →
        </span>
      </div>

      <div
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
          <span style={{ fontSize: 'var(--rotulo-tam)', fontWeight: 700, letterSpacing: 'var(--rotulo-esp)', textTransform: 'uppercase', color: 'var(--acento)', border: '1px solid rgba(200,155,74,.4)', borderRadius: 100, padding: '4px 8px', flexShrink: 0 }}>
            IA
          </span>
          <div
            onClick={() => setOpen(false)}
            style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx-2)', fontSize: 16, cursor: 'pointer', flexShrink: 0 }}
          >
            ×
          </div>
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
              <div
                onClick={() => setCalOffset((o) => Math.max(0, o - 1))}
                style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--linea-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, cursor: 'pointer' }}
              >
                ‹
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-.01em', textTransform: 'capitalize' }}>{calMonth}</span>
              <div
                onClick={() => setCalOffset((o) => Math.min(6, o + 1))}
                style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--linea-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, cursor: 'pointer' }}
              >
                ›
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
              {calWeekdays.map((w, i) => (
                <span key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, letterSpacing: '.06em', color: 'var(--tx-4)' }}>
                  {w}
                </span>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
              {cells.map((d, i) => (
                <div
                  key={i}
                  onClick={() => d.value && submit(d.value, { diaISO: d.iso })}
                  style={{
                    height: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 9,
                    cursor: d.free ? 'pointer' : undefined,
                    color: d.free ? (d.sel ? '#FFFFFF' : 'var(--tx)') : 'var(--tx-4)',
                    background: d.free ? (d.sel ? 'var(--acento)' : 'var(--linea)') : 'transparent',
                    border: d.free ? `1px solid ${d.sel ? 'var(--acento)' : 'var(--linea)'}` : '1px solid transparent',
                  }}
                >
                  {d.label}
                </div>
              ))}
            </div>
            <span style={{ fontSize: 10, lineHeight: 1.5, color: 'var(--tx-3)' }}>{t.ch_cal}</span>
          </div>
        )}

        {opts.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '0 16px 12px', flexShrink: 0 }}>
            {opts.map((o) => (
              <div
                key={o}
                onClick={() => submit(o)}
                style={{ border: '1px solid rgba(200,155,74,.5)', color: 'var(--acento)', borderRadius: 100, padding: '9px 14px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                {o}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: typable ? 'flex' : 'none', alignItems: 'center', gap: 9, margin: '0 16px 12px', padding: '7px 7px 7px 14px', border: '1px solid var(--linea-2)', borderRadius: 100, flexShrink: 0 }}>
          <input
            id="chat-input"
            ref={inputRef}
            type="text"
            value={draft}
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
          <div
            onClick={() => submit(draft)}
            style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--boton)', color: 'var(--boton-tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            →
          </div>
        </div>
        <div style={{ padding: '0 17px 13px', fontSize: 10, lineHeight: 1.6, color: 'var(--tx-4)' }}>{t.ch_priv}</div>
      </div>
    </>
  );
});

export default ChatWidget;
