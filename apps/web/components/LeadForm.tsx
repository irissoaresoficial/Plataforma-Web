'use client';

import { useState } from 'react';
import { sendLead } from '@/lib/sendLead';
import { CONTACTO } from '@/content/site';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Formulario de captación reutilizable. Solo dice "guardado" cuando el correo
 * se ha guardado de verdad en la hoja: si falla, lo dice.
 */
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
}) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [err, setErr] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const dark = variant === 'dark';
  const inputStyle: React.CSSProperties = dark
    ? { background: 'var(--linea)', border: '1px solid var(--linea-2)', color: 'var(--tx)' }
    : { background: '#FFFFFF', border: '1px solid var(--linea)', color: 'var(--tx)' };

  const enviar = async () => {
    if (pedirNombre && nombre.trim().length < 2) return setErr('Escribe tu nombre.');
    if (!EMAIL_RE.test(email)) return setErr('Ese correo no parece válido.');
    setErr('');
    setSending(true);
    const partes = [detalle, whatsapp.trim() ? `WhatsApp: ${whatsapp.trim()}` : ''].filter(Boolean);
    const ok = await sendLead({ email, nombre, origen, detalle: partes.join(' · '), whatsapp: whatsapp.trim() });
    setSending(false);
    if (ok) setDone(true);
    else setErr(`No he podido guardarlo ahora mismo. Inténtalo en un minuto o escribe a ${CONTACTO.email}.`);
  };

  if (done) {
    return (
      <div
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
        <span style={{ fontSize: 16, fontWeight: 700, color: dark ? '#7CC48A' : '#2F5D50' }}>{successTitle}</span>
        <span style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--tx-2)' }}>{successText}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {pedirNombre && (
        <input
          type="text"
          value={nombre}
          placeholder="Tu nombre"
          onChange={(e) => {
            setNombre(e.target.value);
            setErr('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && enviar()}
          className="field-input"
          style={inputStyle}
        />
      )}
      <input
        type="email"
        value={email}
        placeholder="tucorreo@ejemplo.com"
        onChange={(e) => {
          setEmail(e.target.value);
          setErr('');
        }}
        onKeyDown={(e) => e.key === 'Enter' && enviar()}
        className="field-input"
        style={inputStyle}
      />
      {pedirWhatsapp && (
        <input
          type="tel"
          value={whatsapp}
          placeholder="WhatsApp (opcional)"
          onChange={(e) => {
            setWhatsapp(e.target.value);
            setErr('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && enviar()}
          className="field-input"
          style={inputStyle}
        />
      )}
      <div
        onClick={enviar}
        data-mag
        className={`pill ${dark ? 'pill-gold' : 'pill-dark'}`}
        style={{ justifyContent: 'center', padding: '15px 20px', opacity: sending ? 0.6 : 1 }}
      >
        <span>{sending ? 'Guardando…' : cta}</span>
        <span>→</span>
      </div>
      {err && <span style={{ fontSize: 13, color: dark ? '#E08585' : '#A33B3B' }}>{err}</span>}
      <span style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--tx-3)' }}>{privacidad}</span>
    </div>
  );
}
