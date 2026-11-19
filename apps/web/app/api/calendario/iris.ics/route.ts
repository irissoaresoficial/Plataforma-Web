/**
 * El calendario .ics al que se suscribe Google (ver lib/calendario.ts).
 * Sin la llave buena no enseña nada. Sólo citas que no estén anuladas, desde
 * hace 60 días: lo viejo no le sirve a Iris en el móvil.
 */
import { db } from '@/lib/firebase';
import { ics, llaveValida, type CitaCal } from '@/lib/calendario';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const k = new URL(request.url).searchParams.get('k') || '';
  if (!llaveValida(k)) return new Response('No', { status: 404 });
  const base = db();
  if (!base) return new Response('Sin base de datos', { status: 503 });

  const desde = new Date(Date.now() - 60 * 86400000).toISOString();
  const [citas, clientes] = await Promise.all([
    base.collection('citas').where('inicioISO', '>=', desde).get(),
    base.collection('clientes').get(),
  ]);
  const nombre = new Map(clientes.docs.map((d) => [d.id, String(d.get('nombre') || '')]));
  const lista: Array<CitaCal & { yaEnGoogle: boolean }> = citas.docs
    .map((d) => d.data() as { inicioISO?: string; minutos?: number; tipo?: string; estado?: string; personaId?: string; googleEventId?: string })
    .map((c, i) => ({
      id: citas.docs[i].id,
      inicioISO: String(c.inicioISO || ''),
      minutos: Number(c.minutos) || 60,
      tipo: String(c.tipo || ''),
      estado: String(c.estado || ''),
      quien: nombre.get(String(c.personaId || '')) || '',
      yaEnGoogle: Boolean(c.googleEventId),
    }))
    /* Las que ya tienen evento en Google (las crea el Apps Script al reservar
       desde la web) no se repiten: saldrían dos veces en su calendario. */
    .filter((c) => c.estado !== 'anulada' && !c.yaEnGoogle);

  return new Response(ics(lista), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="escuela-sabiduria-33.ics"',
      'Cache-Control': 'no-store',
    },
  });
}
