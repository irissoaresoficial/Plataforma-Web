/**
 * EL CORREO DE BIENVENIDA A LA PLATAFORMA.
 *
 * Gerson, el 20 de octubre de 2026, mirando el que manda Firebase de serie:
 * «ese correo para admitirlo, dale un diseño, algo bonito». El de Firebase va
 * en inglés, firmado por «plataforma team» y con un enlace de tres líneas a la
 * vista. A alguien que Iris acaba de dar de alta eso le parece un correo de
 * estafa, y no lo abre.
 *
 * Éste es el mismo enlace —lo genera Firebase con la clave de administrador,
 * así que funciona igual— metido en la casa: el vino, el oro, el logo, en
 * castellano y firmado por Iris. Los colores van escritos porque un cliente de
 * correo no lee variables: son los de MARCA.md §3.
 */
const VINO = '#451a25';
const TINTA = '#221d1f';
const PAPEL = '#ffffff';
const ORO = '#e2cda2';
const ARENA = '#f1ede4';
const GRIS = '#6b6564';

const WEB = process.env.NEXT_PUBLIC_SITE_URL || 'https://escueladesabiduria33.com';

function limpio(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Qué va a encontrar dentro, según las llaves que le haya dado Iris. */
const QUE_HAY: Record<string, string> = {
  alumno: 'Tus cursos, con sus clases en vídeo y su material.',
  miembro: 'La comunidad, para preguntar y leer a las demás.',
  creador: 'Tu espacio para montar tus cursos, con su agenda y sus métricas.',
  admin: 'La plataforma entera.',
};

export function correoDeBienvenida(d: { nombre: string; enlace: string; roles: string[]; plataforma: string }) {
  const nombre = limpio(d.nombre.trim().split(/\s+/)[0] || 'hola');
  const lista = d.roles
    .map((r) => QUE_HAY[r])
    .filter(Boolean)
    .map((t) => `<tr><td style="padding:6px 0;vertical-align:top;color:${ORO};font-size:16px;width:22px">✦</td><td style="padding:6px 0;font-size:15px;line-height:1.5;color:${TINTA}">${t}</td></tr>`)
    .join('');

  const asunto = `${nombre}, ya tienes tu sitio en la Escuela de Sabiduría 33`;
  const html = `<div style="display:none;max-height:0;overflow:hidden;opacity:0">Elige tu contraseña y entra. El enlace dura una hora.</div>
<div style="margin:0;padding:32px 12px;background:${ARENA}">
  <div style="max-width:560px;margin:0 auto;background:${PAPEL};border-radius:20px;overflow:hidden;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif">

    <div style="background:${VINO};padding:34px 30px 30px;text-align:center">
      <img src="${WEB}/images/logo-33-blanco.png" width="88" height="88" alt="Escuela de Sabiduría 33" style="display:block;margin:0 auto 14px;width:88px;height:88px">
      <div style="font-size:11px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:${ORO}">Escuela de Sabiduría 33</div>
    </div>

    <div style="padding:36px 32px 10px;color:${TINTA}">
      <h1 style="margin:0 0 14px;font-size:28px;line-height:1.2;font-weight:500;letter-spacing:-.02em;color:${TINTA}">Te damos la bienvenida, ${nombre}.</h1>
      <p style="margin:0 0 22px;font-size:16px;line-height:1.65;color:${TINTA}">
        Te he dado acceso a la plataforma de la escuela. Para entrar sólo te falta una cosa: elegir tu contraseña.
      </p>

      <div style="text-align:center;margin:30px 0 28px">
        <a href="${d.enlace}" style="display:inline-block;background:${VINO};color:${PAPEL};text-decoration:none;font-size:16px;font-weight:600;padding:16px 34px;border-radius:100px">
          Elegir mi contraseña &nbsp;<span style="color:${ORO}">→</span>
        </a>
      </div>

      ${
        lista
          ? `<p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${GRIS}">Lo que vas a encontrar dentro</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px;border-collapse:collapse">${lista}</table>`
          : ''
      }

      <p style="margin:0 0 6px;font-size:14px;line-height:1.6;color:${GRIS}">
        El botón dura una hora. Si se te pasa, entra en
        <a href="${d.plataforma}" style="color:${VINO}">${d.plataforma.replace(/^https?:\/\//, '')}</a>
        y pulsa «He olvidado mi contraseña»: te llega otro.
      </p>

      <div style="margin:30px 0 0;padding:20px 0 28px;border-top:1px solid #ece8e0">
        <p style="margin:0;font-size:16px;line-height:1.6;color:${TINTA}">Iris Soares</p>
        <p style="margin:2px 0 0;font-size:13px;color:${GRIS}">Escuela de Sabiduría 33</p>
      </div>
    </div>
  </div>
  <p style="max-width:560px;margin:16px auto 0;font-size:12px;line-height:1.6;color:${GRIS};text-align:center;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif">
    Recibes esto porque Iris te ha dado de alta en su escuela. Si no sabes por qué, ignóralo: sin elegir contraseña nadie puede entrar con tu correo.
  </p>
</div>`;

  return { asunto, html };
}
