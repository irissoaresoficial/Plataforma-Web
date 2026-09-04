/**
 * Envía un correo captado a /api/lead. Devuelve si se ha guardado de verdad,
 * para que los formularios no digan "guardado" cuando no lo está.
 */
export async function sendLead(payload: {
  email: string;
  nombre?: string;
  origen: string;
  detalle?: string;
  lang?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang: 'es', nombre: '', detalle: '', ...payload }),
    });
    const data = await res.json().catch(() => null);
    return !!data?.ok;
  } catch {
    return false;
  }
}
