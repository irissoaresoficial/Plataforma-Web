import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Comprobación de que la web y el Apps Script se entienden.
 * Se abre en el navegador: <tu-web>/api/diagnostico
 *
 * Contesta en castellano qué está bien y qué falta. Nunca devuelve la URL ni la
 * contraseña del script: solo si están puestas y qué ha contestado Google.
 */
export async function GET() {
  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;

  const pasos: { paso: string; ok: boolean; detalle: string }[] = [];

  pasos.push({
    paso: 'Variable APPS_SCRIPT_URL',
    ok: Boolean(url),
    detalle: url
      ? `Puesta. Empieza por ${url.slice(0, 46)}… y ${url.endsWith('/exec') ? 'acaba en /exec, correcto' : 'NO acaba en /exec: esa no es la URL buena'}`
      : 'Falta. En Vercel: Environments → Production → Environment Variables → Add.',
  });

  pasos.push({
    paso: 'Variable APPS_SCRIPT_SECRET',
    ok: Boolean(secret),
    detalle: secret
      ? `Puesta, ${secret.length} caracteres. Tiene que ser idéntica al SECRET del script.`
      : 'Falta. Tiene que valer lo mismo que el SECRET de dentro del Apps Script.',
  });

  if (!url) {
    return NextResponse.json({ listo: false, pasos, siguiente: 'Pon las dos variables en Vercel y vuelve a desplegar (Deployments → ··· → Redeploy).' });
  }

  // Le preguntamos al script por los huecos libres: es la llamada más inofensiva
  // que existe y prueba de una vez la URL, la contraseña y el calendario.
  let respuesta = '';
  let datos: any = null;
  let estado = 0;
  try {
    const r = await fetch(`${url}?action=availability&secret=${encodeURIComponent(secret || '')}`, {
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
    });
    estado = r.status;
    respuesta = (await r.text()).slice(0, 400);
    try {
      datos = JSON.parse(respuesta);
    } catch {}
  } catch (err) {
    pasos.push({
      paso: 'Llamar al Apps Script',
      ok: false,
      detalle: `No se pudo conectar: ${String(err)}. Suele ser una URL mal copiada.`,
    });
    return NextResponse.json({ listo: false, pasos, siguiente: 'Revisa que la URL sea la que acaba en /exec, sin espacios ni cortes.' });
  }

  if (!datos) {
    const pideLogin = /accounts\.google\.com|iniciar sesión|Sign in/i.test(respuesta);
    pasos.push({
      paso: 'Llamar al Apps Script',
      ok: false,
      detalle: pideLogin
        ? 'Google devuelve una pantalla de inicio de sesión: el despliegue no está abierto a todo el mundo.'
        : `Google contestó ${estado} pero no en el formato esperado. Empieza así: ${respuesta.slice(0, 120)}`,
    });
    return NextResponse.json({
      listo: false,
      pasos,
      siguiente: pideLogin
        ? 'En Apps Script: Implementar → Gestionar implementaciones → lápiz → Quién tiene acceso: Cualquier usuario → Nueva versión.'
        : 'Abre la URL del script en el navegador a ver qué sale.',
    });
  }

  if (!datos.ok) {
    const esSecret = datos.reason === 'secret';
    pasos.push({
      paso: 'Contraseña compartida',
      ok: false,
      detalle: esSecret
        ? 'El script ha rechazado la contraseña: APPS_SCRIPT_SECRET y el SECRET del script no coinciden.'
        : `El script ha contestado: ${datos.reason}`,
    });
    return NextResponse.json({
      listo: false,
      pasos,
      siguiente: esSecret
        ? 'Copia el SECRET del script y pégalo tal cual en Vercel. Después, Redeploy.'
        : 'Mírate ese motivo en el archivo reservas.gs.',
    });
  }

  const dias = Array.isArray(datos.days) ? datos.days.length : 0;
  pasos.push({ paso: 'Llamar al Apps Script', ok: true, detalle: 'Contesta correctamente.' });
  pasos.push({
    paso: 'Huecos en el calendario',
    ok: dias > 0,
    detalle: dias > 0
      ? `${dias} días con hueco libre. El chat ya ofrece fechas de verdad.`
      : 'El script funciona, pero no encuentra ni un hueco libre. Revisa HOURS y DAYS_AHEAD, o si el calendario está lleno.',
  });

  return NextResponse.json({
    listo: dias > 0,
    pasos,
    siguiente: dias > 0
      ? 'Todo conectado. Haz una reserva de prueba con tu propio correo y mira la hoja, el calendario y el buzón.'
      : 'Libera algún hueco en el calendario o amplía DAYS_AHEAD en el script.',
  });
}
