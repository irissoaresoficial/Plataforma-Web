/**
 * LAS MÉTRICAS DE LA PLATAFORMA, AL DÍA Y SOLAS (10 de noviembre de 2026).
 *
 * Gerson: «¿cómo pongo esto dentro de la plataforma? […] lo quiero».
 *
 * La pantalla de Métricas de la plataforma lee la colección `campana`, un
 * documento por día (ver apps/plataforma/src/lib/despacho/campana.ts). Hasta
 * hoy la rellenaba a mano `scripts/campana-dia.mjs`, que necesita una llave
 * de Firebase en el ordenador de quien lo corre — así que dejó de rellenarse
 * y la pantalla se quedó en 73,71 € mientras Meta iba por 132,05 €.
 *
 * Ahora lo hace la web cada mañana, dentro del mismo reloj que manda los
 * recordatorios. Lee a Meta con `META_ADS_TOKEN` (un token de usuario con
 * permiso `ads_read`, que dura 60 días: de sobra hasta la masterclass) y
 * escribe con la llave de Firebase que la web ya tiene en Vercel.
 *
 * Reescribe los últimos 7 días, no sólo ayer: Meta corrige sus cifras durante
 * unos días, y si una mañana falla, la siguiente rellena el hueco. Escribe con
 * `merge`, así que no borra lo que el script manual hubiera puesto aparte
 * (el plan, la previsión).
 *
 * Si no hay token, no hace nada y lo dice. Nunca rompe los recordatorios.
 */

import { db } from '@/lib/firebase';

const CUENTA = process.env.META_AD_ACCOUNT || '289692277';
const API = 'https://graph.facebook.com/v22.0';
const MEDIOS_DE_PAGO = new Set(['cpc', 'ppc', 'paid', 'paid_social', 'ads']);

type Fila = Record<string, unknown> & { date_start: string; actions?: Array<{ action_type: string; value: string }> };

const n = (x: unknown) => (Number.isFinite(Number(x)) ? Number(x) : 0);
const accion = (f: Fila, tipo: string) => n(f.actions?.find((a) => a.action_type === tipo)?.value);
const dia = (d: Date) => d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });

async function lee(token: string, nivel: 'account' | 'ad', campos: string, desde: string, hasta: string): Promise<Fila[]> {
  const q = new URLSearchParams({
    level: nivel,
    fields: campos,
    time_increment: '1',
    time_range: JSON.stringify({ since: desde, until: hasta }),
    limit: '500',
    access_token: token,
  });
  const r = await fetch(`${API}/act_${CUENTA}/insights?${q}`, { cache: 'no-store' });
  const j = (await r.json()) as { data?: Fila[]; error?: { message?: string } };
  if (!r.ok || j.error) throw new Error(j.error?.message || `Meta contestó ${r.status}`);
  return j.data ?? [];
}

export async function sincronizaCampana(): Promise<{ ok: boolean; dias?: number; nota?: string }> {
  const token = process.env.META_ADS_TOKEN;
  if (!token) return { ok: false, nota: 'falta META_ADS_TOKEN en Vercel' };
  const base = db();
  if (!base) return { ok: false, nota: 'falta Firebase' };

  try {
    const hasta = dia(new Date());
    const desde = dia(new Date(Date.now() - 6 * 86400000));
    const [cuenta, anuncios] = await Promise.all([
      lee(token, 'account', 'spend,impressions,reach,frequency,inline_link_clicks,actions', desde, hasta),
      lee(token, 'ad', 'ad_name,spend,inline_link_clicks', desde, hasta),
    ]);

    /* Los apuntados de cada día se cuentan contra `leads`, como el script. */
    const leads = await base.collection('leads').get();
    const apuntados: Record<string, { todos: number; pago: number }> = {};
    for (const x of leads.docs) {
      const v = x.data() as { alta?: { toDate?: () => Date } | string; campana?: { medium?: string; campaign?: string } };
      const t = typeof v.alta === 'object' && v.alta?.toDate ? v.alta.toDate() : v.alta ? new Date(String(v.alta)) : null;
      if (!t || Number.isNaN(t.getTime())) continue;
      const k = dia(t);
      apuntados[k] ??= { todos: 0, pago: 0 };
      apuntados[k].todos += 1;
      const c = v.campana;
      if (c && (MEDIOS_DE_PAGO.has(String(c.medium || '').toLowerCase()) || String(c.campaign || '').trim())) apuntados[k].pago += 1;
    }

    const lote = base.batch();
    for (const f of cuenta) {
      const delDia = anuncios
        .filter((a) => a.date_start === f.date_start && n(a.spend) > 0)
        .map((a) => ({ nombre: String(a.ad_name || '').slice(0, 200), gasto: n(a.spend), clics: n(a.inline_link_clicks) }));
      lote.set(
        base.collection('campana').doc(f.date_start),
        {
          dia: f.date_start,
          gasto: n(f.spend),
          impresiones: n(f.impressions),
          alcance: n(f.reach),
          frecuencia: n(f.frequency),
          clics: n(f.inline_link_clicks),
          aterrizajes: accion(f, 'landing_page_view'),
          apuntados: apuntados[f.date_start]?.todos ?? 0,
          apuntadosDePago: apuntados[f.date_start]?.pago ?? 0,
          ...(delDia.length ? { anuncios: delDia } : {}),
          escrito: new Date().toISOString(),
          via: 'web',
        },
        { merge: true },
      );
    }
    await lote.commit();
    return { ok: true, dias: cuenta.length };
  } catch (err) {
    console.error('[campana] no se ha podido leer Meta', String(err).slice(0, 200));
    return { ok: false, nota: String(err).slice(0, 200) };
  }
}
