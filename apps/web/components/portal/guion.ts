/* El motor del portal. Era un IIFE dentro de la página suelta; aquí es una
 * función que se llama al montar y devuelve su propia limpieza, que es lo que
 * React necesita para no dejar escuchas colgando al cambiar de página. */
/* eslint-disable */
// @ts-nocheck
export function arrancaPortal(): () => void {

'use strict';

/* ------------------------------------------------------------ la limpieza
 * Esto era una página suelta: se cargaba, corría para siempre y se acababa
 * cerrando la pestaña. Dentro de la web no: al salir de la portada hay que
 * apagarlo todo o se quedan dos bucles de animación y seis escuchas corriendo
 * encima de la página siguiente — y además el temporizador que borra el
 * contador salta cuando ya no hay contador y revienta con un null.
 */
let vivo = true;
const basura: Array<() => void> = [];
const enVentana = (que: string, fn: any, opc?: any) => {
  window.addEventListener(que, fn, opc);
  basura.push(() => window.removeEventListener(que, fn, opc));
};
const enDocumento = (que: string, fn: any, opc?: any) => {
  document.addEventListener(que, fn, opc);
  basura.push(() => document.removeEventListener(que, fn, opc));
};
const luego = (fn: () => void, ms: number) => {
  const id = setTimeout(() => { if (vivo) fn(); }, ms);
  basura.push(() => clearTimeout(id));
  return id;
};

/* ======================================================================
   EL RECORRIDO, EN DATOS
   ======================================================================
   Lo que pone en cada ficha es verdad y es de esta casa: la base 22 sale de
   la fecha y la base 9 del nombre completo; el árbol tiene diez puntos y
   veintidós caminos. Un dato inventado en una pantalla que vende se nota, y
   no hacía falta: lo que hay ya es bastante. */
const ETAPAS = ['La pregunta', 'Numerología', 'Kábala', 'Iris Soares', 'La escuela', 'Los cursos'];

/* ============================================================================
 * LA HISTORIA, EN SEIS PARADAS
 * ============================================================================
 * Gerson: «que a medida del scrolling vaya contando como una historia, que
 * inicie con una pregunta, en la mitad presentes a Iris, y al finalizar un
 * CTA redirigiendo a los cursos».
 *
 * Eso es exactamente este orden, y cada parada hace una cosa:
 *
 *   1. LA PREGUNTA   engancha. No se presenta nadie ni se vende nada: se dice
 *                    en voz alta lo que le está pasando a quien entra. Si no
 *                    se reconoce aquí, lo demás da igual.
 *   2. NUMEROLOGÍA   la primera respuesta: de dónde sale.
 *   3. KÁBALA        la segunda: dónde se ve entero.
 *   4. IRIS          justo en la mitad, que es donde tiene que ir. Antes es un
 *                    folleto —alguien presentándose sin que le hayas
 *                    preguntado—; después, nadie llega.
 *   5. LA ESCUELA    el giro: no te la lee, te enseña a leerla.
 *   6. LOS CURSOS    el único botón de la pieza, y sale al final.
 *
 * Antes empezaba en «Numerología». Era bonito y no contaba nada: una ficha
 * técnica de algo que todavía no sabes para qué sirve.
 */
const DATOS = {
  pregunta: {
    nombre: '¿Por qué se repite?', orden: 0,
    datos: [
      ['En el trabajo:', 'Cambias, y a los seis meses te sientes igual.'],
      ['En la pareja:', 'La misma discusión, con otra persona.'],
      ['Con el dinero:', 'Entra, y se va siempre por el mismo sitio.'],
      ['Lo que nadie dice:', 'Que eso ya le pasaba a alguien antes que a ti.'],
    ],
  },
  numerologia: {
    nombre: 'Numerología', orden: 1,
    datos: [
      ['De dónde sale:', 'De tu fecha y de tu nombre completo. Nada más.'],
      ['Base 22:', 'La fecha. Dice cómo te comportas.'],
      ['Base 9:', 'El nombre. Dice de qué estás hecho.'],
      ['Lo que se mira:', 'Lo que se repite, los huecos, y lo que salta una generación.'],
    ],
  },
  kabala: {
    nombre: 'Kábala', orden: 2,
    datos: [
      ['El árbol:', 'Diez puntos y veintidós caminos. La carta entera cabe ahí.'],
      ['Imagen del alma:', 'Lo que traías antes de que nadie te pusiera un nombre.'],
      ['Cuentas abiertas:', 'Lo que en tu familia nunca se contó, y lo estás pagando tú.'],
      ['Ciclos vitales:', 'En qué tramo estás y qué toca ahora.'],
    ],
  },
  iris: {
    nombre: 'Iris Soares', orden: 3, retrato: true, foco: .3,
    imagen: '/images/iris-consulta.jpg',
    datos: [
      ['Quién:', 'Iris Soares, numerología transgeneracional.'],
      ['Desde:', 'Consulta online desde 2010.'],
      ['Qué hace:', 'Levanta tu carta y la lee contigo, en directo.'],
      ['Lo que no hace:', 'Adivinar el futuro. Esto explica el presente.'],
    ],
  },
  escuela: {
    nombre: 'La escuela', orden: 4, retrato: true, foco: .5,
    imagen: '/images/la-cuenta.jpg',
    datos: [
      ['Qué es:', 'Escuela de Sabiduría 33.'],
      ['La diferencia:', 'Aquí no te leen la carta. Aprendes a leerla tú.'],
      ['Cómo:', 'En directo, con tu caso encima de la mesa.'],
      ['Qué te llevas:', 'Tu carta, la de tu pareja y la de tus hijos. Hechas por ti.'],
    ],
  },
  cursos: {
    nombre: 'Los cursos', orden: 5, retrato: true, foco: .5,
    imagen: '/images/desordenes-amorosos-cartel.jpg',
    datos: [
      ['Qué hay:', 'Cursos y talleres en directo, y quedan grabados.'],
      ['Ahora mismo:', 'Desórdenes Amorosos. Fechas por confirmar.'],
      ['Lo que viene:', 'Van saliendo poco a poco. Están todos en el catálogo.'],
    ],
    accion: { texto: 'Ver los cursos', href: '/cursos' },
  },
};

/*
 * LOS TRAMOS, Y LOS DOS NÚMEROS QUE LLEVA CADA UNO.
 *
 * `ventana` dice cuánto está abierta la ventana al empezar y al acabar el
 * tramo: 0 es pequeña en el centro, 1 es la pantalla entera. `cinta` dice por
 * qué segundo va la película, de 0 a 1.
 *
 * Leídos en vertical se ve la pieza entera: la mirilla pequeña mientras se
 * hace la pregunta, se abre con la cuenta (0→1), te deja dentro del árbol
 * (1), y se cierra sobre ella (1→0) para quedarse de retrato en las tres
 * últimas. Y la cinta corre sin parar de 0 a 1 mientras tanto, así que los
 * números se vuelven el árbol sin un solo corte.
 *
 * IRIS CAE EN EL 0,56 DEL RECORRIDO. No es casualidad: es «en la mitad».
 */
const TRAMOS = [
  { etapa: 'pregunta',    desde: 0,   hasta: .14, ventana: [0, 0], cinta: [0, .10] },
  { etapa: 'numerologia', desde: .14, hasta: .28, ventana: [0, 0], cinta: [.10, .30] },
  /* EL CORTE ESTÁ MEDIDO, NO PUESTO A OJO. Contando píxeles de luz en el
     plano, el árbol no está formado hasta el 0,84 de la cinta: con la Kábala
     empezando antes, el titular decía KÁBALA y en pantalla seguía habiendo
     números sueltos. El paso ES la transcendencia, no un corte entre dos
     cosas. */
  { etapa: 'numerologia', desde: .28, hasta: .42, ventana: [0, 1], cinta: [.30, .84] },
  { etapa: 'kabala',      desde: .42, hasta: .52, ventana: [1, 1], cinta: [.84, 1] },
  { etapa: 'iris',        desde: .52, hasta: .60, ventana: [1, 0], cinta: [1, 1] },
  { etapa: 'iris',        desde: .60, hasta: .70, ventana: [0, 0], cinta: [1, 1] },
  { etapa: 'escuela',     desde: .70, hasta: .86, ventana: [0, 0], cinta: [1, 1] },
  { etapa: 'cursos',      desde: .86, hasta: 1,   ventana: [0, 0], cinta: [1, 1] },
];

/* ---------------------------------------------------------------- piezas */
const $ = (id) => document.getElementById(id);
const recorrido = $('recorrido');
const lienzo = $('lienzo-ventana');
const ctx = lienzo.getContext('2d');
const ventana = $('ventana');
const ventanaVideo = $('ventana-video');
const ventanaImagen = $('ventana-imagen');
const cursor = document.querySelector('.cursor');
const aro = document.querySelector('.cursor-aro');
const punto = document.querySelector('.cursor-punto');

/* --------------------------------------------------- qué plano se baja */
(function planos() {
  const mp4 = ventanaVideo.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '';
  const ext = mp4 ? 'mp4' : 'webm';
  const forma = window.matchMedia('(max-width: 759px)');
  const antesalaVideo = $('antesala-video');

  const pon = (v, nombre, vertical) => {
    const nueva = `/video/${nombre}${vertical ? '-vertical' : ''}.${ext}`;
    if (v.src.endsWith(nueva)) return;
    /* Al girar el móvil se cambia de plano, y hay que devolverlo al mismo
       punto: si no, al girar el recorrido se va al principio. Los dos duran
       lo mismo, así que basta con el segundo. */
    const donde = v.currentTime;
    v.src = nueva;
    if (donde > 0) v.addEventListener('loadedmetadata', () => { v.currentTime = donde; }, { once: true });
  };
  const reparte = () => {
    pon(ventanaVideo, 'recorrido', forma.matches);
    pon(antesalaVideo, 'antesala', forma.matches);
  };
  reparte();
  forma.addEventListener('change', reparte);
  basura.push(() => forma.removeEventListener('change', reparte));
})();

let actual = 'numerologia';
let expansion = 0;
let girX = 0, girY = 0, metaX = 0, metaY = 0;
let ultimo = performance.now();

const suave = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const entre = (a, b, t) => a + (b - a) * t;

/* Quitar y volver a poner una clase para que su animación vuelva a correr. El
   `offsetWidth` de en medio no sobra: sin esa lectura el navegador junta los
   dos cambios en uno y la animación no se entera de que ha pasado nada. */
function reaviva(el, clase) {
  if (!el) return;
  el.classList.remove(clase);
  void el.offsetWidth;
  el.classList.add(clase);
}

/* ------------------------------------------------------------- pintar */
function midelienzo() {
  const d = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth, h = window.innerHeight;
  lienzo.width = w * d; lienzo.height = h * d;
  lienzo.style.width = w + 'px'; lienzo.style.height = h + 'px';
  ctx.setTransform(d, 0, 0, d, 0, 0);
}

/* El metraje se pinta a pantalla completa y quieto, no dentro de la ventana.
   Esa es toda la gracia: la imagen se queda donde está y lo que se mueve es
   el agujero por donde se ve.

   DOS JUEGOS DE PLANOS, NO UNO. El metraje es apaisado y un teléfono es
   vertical: recortarlo para que llene la pantalla se comía dos tercios del
   ancho, y lo que hay a los lados no es relleno —es el árbol—. En el móvil
   salían tres puntos de luz sueltos.

   Así que hay una versión 9:16 de verdad de los dos planos. Están hechos del
   mismo fotograma: el plano cabe de ancho, y el papel de arriba y de abajo es
   ese mismo fotograma ampliado, desenfocado y DESVANECIDO contra él (78 px de
   pluma). Como sale del propio fotograma, la luz y la sombra que cruzan el
   plano cruzan también el relleno, y no hay canto que disimular — que es
   exactamente lo que le pasaba al vertical viejo de la portada, donde el
   papel iba estirado desde las filas del borde y dejaba una raya recta.

   Cuál se baja se decide aquí y no con el atributo `media` de `<source>`, que
   unos navegadores respetan y otros no. Cada persona se descarga uno solo. */
const ESTRECHO = () => window.innerWidth < 760;

function cubre(c, media) {
  const mw = media.videoWidth || media.naturalWidth;
  const mh = media.videoHeight || media.naturalHeight;
  if (!mw || !mh) return false;
  const w = window.innerWidth, h = window.innerHeight;
  const grande = Math.max(w / mw, h / mh);
  c.drawImage(media, (w - mw * grande) / 2, (h - mh * grande) / 2, mw * grande, mh * grande);
  return true;
}

/* EL OTRO ENCUADRE: A LA VENTANA, NO A LA PANTALLA.
   Para un retrato el de arriba es un desastre: la ventana ocupa un tercio del
   ancho, así que de una foto vertical enseñaba un ojo. Comprobado mirándolo.
   `foco` dice qué altura de la foto —de 0 arriba a 1 abajo— tiene que quedar
   en el medio del hueco, y se limita a lo que cabe para no destapar un borde:
   antes se pierde encuadre que se enseña un hueco. */
function cubreVentana(c, media, cx, cy, cw, ch, foco) {
  const mw = media.videoWidth || media.naturalWidth;
  const mh = media.videoHeight || media.naturalHeight;
  if (!mw || !mh) return false;
  const e = Math.max(cw / mw, ch / mh);
  const dw = mw * e, dh = mh * e;
  let y = cy - dh / 2;
  if (foco != null && dh > ch) y = Math.min(cy - ch / 2, Math.max(cy + ch / 2 - dh, cy - dh * foco));
  c.drawImage(media, cx - dw / 2, y, dw, dh);
  return true;
}

/* Los puntos de un rectángulo redondeado, centrados en el origen: cada
   esquina se recorre en diez pasos, así que salen unos 44 puntos. Hacen falta
   sueltos para poder proyectarlos uno a uno. */
function puntosCaja(w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  const p = [];
  const esquinas = [
    [w / 2 - r, -h / 2 + r, -Math.PI / 2, 0],
    [w / 2 - r, h / 2 - r, 0, Math.PI / 2],
    [-w / 2 + r, h / 2 - r, Math.PI / 2, Math.PI],
    [-w / 2 + r, -h / 2 + r, Math.PI, Math.PI * 1.5],
  ];
  for (const [cx, cy, a0, a1] of esquinas) {
    for (let i = 0; i <= 10; i++) {
      const a = a0 + (a1 - a0) * (i / 10);
      p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }
  return p;
}

/* Perspectiva de mentira con distancia focal 850. No es 3D y no hace falta
   que lo sea: lo que se busca es que el borde de arriba se aleje un poco
   cuando el ratón sube, y eso esto lo hace con cuatro líneas. */
function proyecta(x, y, rx, ry, cx, cy) {
  const ax = rx * Math.PI / 180, ay = ry * Math.PI / 180;
  const xx = x * Math.cos(ay), yy = y * Math.cos(ax);
  const z = x * Math.sin(ay) - y * Math.sin(ax);
  const p = 850 / (850 + z);
  return [cx + xx * p, cy + yy * p];
}

function pinta(ahora) {
  if (!vivo) return;
  const dt = Math.min(40, ahora - ultimo);
  ultimo = ahora;
  const k = Math.min(1, dt * .009);
  girX += (metaX - girX) * k;
  girY += (metaY - girY) * k;

  const w = window.innerWidth, h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);

  const caja = ventana.getBoundingClientRect();
  if (caja.width < 1) return requestAnimationFrame(pinta);

  const e = expansion;
  const cx = entre(caja.left + caja.width / 2, w / 2, e);
  const cy = entre(caja.top + caja.height / 2, h / 2, e);
  const cw = entre(caja.width, w, e);
  const ch = entre(caja.height, h, e);
  /* El radio y la inclinación se relajan a la vez que se abre: a pantalla
     completa no puede quedar ni una esquina redonda ni un grado de giro. */
  const r = 110 * (1 - e);
  const rx = girX * (1 - e), ry = girY * (1 - e);
  const d = DATOS[actual];

  const pts = puntosCaja(cw, ch, r).map(([x, y]) => proyecta(x, y, rx, ry, cx, cy));
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.clip();
  /* Un fondo detrás del metraje: mientras el vídeo no tiene fotogramas, el
     hueco se ve como papel y no como un agujero negro. */
  ctx.fillStyle = '#e3dbcb';
  ctx.fillRect(0, 0, w, h);
  if (d.retrato) cubreVentana(ctx, ventanaImagen, cx, cy, cw, ch, d.foco);
  else cubre(ctx, ventanaVideo);
  ctx.restore();

  /* Un filo finísimo de tinta alrededor. Sin él, sobre marfil la ventana no
     tiene borde y se deshace en el fondo. */
  if (e < .985) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.globalAlpha = (1 - e) * .5;
    ctx.strokeStyle = 'rgba(34,29,31,.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  requestAnimationFrame(pinta);
}

/* ------------------------------------------------------------- dibujar */
let primera = true;
function dibuja() {
  const d = DATOS[actual];
  recorrido.dataset.etapa = actual;
  $('titulo').textContent = d.nombre.toUpperCase();

  /* LA FOTO DE LA VENTANA, POR ETAPA. Antes había una sola y estaba escrita
     en el HTML; ahora las tres últimas paradas enseñan cosas distintas. Se
     cambia sólo si de verdad cambia: asignar el mismo `src` vuelve a cargar
     la imagen en algunos navegadores y se ve el parpadeo. */
  if (d.imagen && !ventanaImagen.src.endsWith(d.imagen)) ventanaImagen.src = d.imagen;

  /* EL BOTÓN SALE DONDE TOCA Y NO ANTES. Pedirle algo a alguien que lleva
     catorce píxeles de página es la forma más rápida de que se vaya. */
  const boton = document.querySelector('.reserva');
  if (boton) {
    if (d.accion) {
      boton.textContent = d.accion.texto;
      boton.setAttribute('href', d.accion.href);
      boton.dataset.puesto = 'si';
    } else {
      boton.dataset.puesto = 'no';
    }
  }

  /* Un parpadeo cortito al cambiar de plano. Entre dos etapas de retrato la
     mirilla mide lo mismo y sólo cambia la foto: sin esto es un corte seco. */
  if (!primera) reaviva(lienzo, 'cambia-plano');

  const dl = $('datos');
  dl.innerHTML = '';
  for (const [clave, valor] of d.datos) {
    const fila = document.createElement('div');
    fila.className = 'dato';
    const dt = document.createElement('dt'); dt.textContent = clave;
    const dd = document.createElement('dd'); dd.textContent = valor;
    fila.append(dt, dd);
    dl.append(fila);
  }

  const lista = $('etapas');
  lista.innerHTML = '';
  ETAPAS.forEach((nombre, i) => {
    const s = document.createElement('span');
    s.className = 'etapa' + (i === d.orden ? ' puesta' : '');
    s.textContent = nombre;
    lista.append(s);
  });
  if (!primera) reaviva(lista, 'cambiando');
  primera = false;
}

function abreContenido() { reaviva(recorrido, 'revelando-contenido'); }

/* ======================================================================
   LA RUEDA MANDA
   ======================================================================
   No se pulsa nada: se baja. La pista mide cuatro pantallas y media y esa
   altura es el carrete. Cuánto se ha bajado —un número de 0 a 1— es lo único
   que decide qué se ve, así que parar a mitad deja la ventana parada a mitad
   y subir lo deshace. Eso es lo que separa esto de una animación que arranca
   sola al asomar: aquí la mano de quien mira pasa la película. */
let tramoPuesto = -1;

/** Pone el vídeo en el segundo que toca, sin reproducirlo. Es lo que hace que
 *  el metraje avance con la rueda en vez de ir por su cuenta. */
function rebobina(video, parte) {
  if (!video || !video.duration || !isFinite(video.duration)) return;
  const t = Math.max(0, Math.min(.995, parte)) * video.duration;
  if (Math.abs(video.currentTime - t) > .02) {
    try { video.currentTime = t; } catch (e) { /* todavía no se puede buscar */ }
  }
}

function alBajar() {
  const alto = $('pista').offsetHeight - window.innerHeight;
  const p = alto > 0 ? Math.max(0, Math.min(1, window.scrollY / alto)) : 0;

  let i = TRAMOS.length - 1;
  while (i > 0 && p < TRAMOS[i].desde) i--;
  const t = TRAMOS[i];
  const local = Math.max(0, Math.min(1, (p - t.desde) / (t.hasta - t.desde)));

  if (i !== tramoPuesto) {
    tramoPuesto = i;
    if (actual !== t.etapa) { actual = t.etapa; dibuja(); abreContenido(); }
    $('baja').style.opacity = i === 0 ? '' : '0';
  }

  const s = suave(local);
  expansion = entre(t.ventana[0], t.ventana[1], s);
  rebobina(ventanaVideo, entre(t.cinta[0], t.cinta[1], local));
}

/* --------------------------------------------------------- la antesala */
function antesala() {
  const v = $('antesala-video');
  const valor = $('cuenta-valor');
  let acabada = false;

  const termina = () => {
    if (acabada) return;
    acabada = true;
    valor.textContent = '100';
    $('cuenta').classList.add('se-va');
    $('sello').classList.add('encajado');
    $('antesala').classList.add('al-fondo');
    document.body.classList.add('antesala-lista');
    document.body.classList.add('abierto');
    tramoPuesto = -1;
    alBajar();
    luego(abreContenido, 850);
    /* Con `?.`: si alguien se va de la portada antes de los 750 ms, el
       contador ya no está y esto reventaba con un null. */
    luego(() => $('cuenta')?.remove(), 750);
    luego(() => $('sello')?.classList.add('asentado'), 2000);
  };

  const cuenta = () => {
    if (acabada) return;
    if (v.duration) valor.textContent = String(Math.round(v.currentTime / v.duration * 100));
    if (vivo) requestAnimationFrame(cuenta);
  };

  const empieza = () => {
    /* El metraje dura lo que dure; la antesala dura tres segundos. Se acelera
       para que cuadren, con un suelo por si el vídeo fuera cortísimo. */
    if (v.duration) v.playbackRate = Math.max(.25, v.duration / 3);
    v.play().then(() => requestAnimationFrame(cuenta)).catch(termina);
  };

  v.addEventListener('ended', termina, { once: true });
  if (v.readyState >= 1) empieza();
  else v.addEventListener('loadedmetadata', empieza, { once: true });
  /* Red lenta, archivo que no llega, autoplay bloqueado: pasados cinco
     segundos se entra igual. Una antesala que no termina es una web rota. */
  luego(termina, 5000);
}

/* ----------------------------------------------------------- el cursor */
let px = window.innerWidth / 2, py = window.innerHeight / 2;
let ax = px, ay = py;
function giraCursor() {
  if (!vivo) return;
  ax += (px - ax) * .2;
  ay += (py - ay) * .2;
  aro.style.transform = 'translate3d(' + ax + 'px,' + ay + 'px,0) translate(-50%,-50%)';
  punto.style.transform = 'translate3d(' + px + 'px,' + py + 'px,0) translate(-50%,-50%)';
  requestAnimationFrame(giraCursor);
}

/* ------------------------------------------------------------ escuchas */
enVentana('resize', () => { midelienzo(); alBajar(); });
enVentana('scroll', alBajar, { passive: true });
enVentana('pointermove', (ev) => {
  px = ev.clientX; py = ev.clientY;
  cursor.classList.add('se-ve');
  metaY = (ev.clientX / window.innerWidth - .5) * 34;
  metaX = (ev.clientY / window.innerHeight - .5) * -30;
});
enVentana('pointerleave', () => { metaX = 0; metaY = 0; });
enDocumento('mouseleave', () => cursor.classList.remove('se-ve'));

/* ------------------------------------------------------------ arranque */
midelienzo();
dibuja();
alBajar();
requestAnimationFrame(pinta);
requestAnimationFrame(giraCursor);
antesala();

return () => {
  vivo = false;
  for (const tirar of basura) { try { tirar(); } catch {} }
};

}
