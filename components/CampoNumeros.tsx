'use client';

import { useEffect, useRef } from 'react';

/**
 * Los números del estudio flotando en el aire.
 *
 * No son puntos genéricos: son las cifras con las que se trabaja —del 1 al 9 y
 * los maestros 11, 22 y 33—, que es de lo que va la casa. Suben muy despacio,
 * las de atrás desenfocadas y las de delante nítidas, y el ratón las aparta.
 *
 * LO QUE HACE FALTA PARA QUE ESTO NO CUESTE LA PÁGINA
 *
 * 1. El desenfoque se aplica UNA vez, al preparar los sellos, y después solo se
 *    copian. Hacerlo con `ctx.filter` en cada frame cuesta un desenfoque
 *    gaussiano a pantalla completa por número y por frame: medido, hundía la
 *    página de 60 a 1 fps.
 * 2. Mientras se está bajando la página, el campo se queda quieto. Son números
 *    que suben a paso de tortuga: que se paren durante el segundo que dura un
 *    gesto de scroll no lo nota nadie, y devuelve la máquina entera al
 *    desplazamiento, que sí se nota. Medido: en el héroe la página iba a 30 fps
 *    y con esto va a 60.
 * 3. El lienzo tiene su propia capa de composición y no pasa de dos millones de
 *    píxeles. Repintarlo así no obliga a repintar la foto ni el titular que
 *    tiene detrás.
 */

const CIFRAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '22', '33'];

/** Capas de profundidad. Cada una con su tamaño, su desenfoque y su ritmo. */
const CAPAS = 7;

type Num = { x: number; y: number; vx: number; vy: number; capa: number; cifra: number; fase: number; vaiven: number; giro: number };

export default function CampoNumeros({
  densidad = 22000,
  /** Sobre papel claro conviene poco; sobre granate aguanta más. */
  intensidad = 1,
}: {
  densidad?: number;
  intensidad?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d', { alpha: true });
    if (!ctx) return;

    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let nums: Num[] = [];
    /** sellos[capa][cifra] = el número ya dibujado y desenfocado, listo para copiar. */
    let sellos: HTMLCanvasElement[][] = [];
    /** Con qué escala se dibujaron los sellos que hay ahora mismo. */
    let escalaSellos = 0;
    let visible = true;

    /*
     * Los números son fondo, no contenido: nunca deben competir con el titular.
     * En el móvil se colaban por encima del texto porque los tamaños estaban en
     * píxeles fijos —una cifra de 39 px ocupa el diez por ciento de una pantalla
     * de 390— así que aquí se encogen y se apagan con el ancho de la ventana.
     */
    const anchoVentana = () => (typeof window === 'undefined' ? 1200 : window.innerWidth);
    const escalaCifras = () => Math.max(0.55, Math.min(1, anchoVentana() / 1100));

    const tamDe = (capa: number) => (11 + capa * 4.6) * escalaCifras(); // de 11 a 39 px en pantalla ancha
    const borronDe = (capa: number) => (CAPAS - 1 - capa) * 1.15 * escalaCifras();
    const alfaDe = (capa: number) => (0.1 + capa * 0.075) * intensidad * (escalaCifras() < 0.75 ? 0.72 : 1);

    /** Dibuja cada cifra en su propio lienzo, con su desenfoque ya aplicado. */
    const prepararSellos = () => {
      sellos = [];
      escalaSellos = escalaCifras();
      for (let capa = 0; capa < CAPAS; capa++) {
        const tam = tamDe(capa);
        const borron = borronDe(capa);
        const margen = Math.ceil(borron * 3 + 4);
        const fila: HTMLCanvasElement[] = [];
        for (const cifra of CIFRAS) {
          const s = document.createElement('canvas');
          const sctx = s.getContext('2d')!;
          sctx.font = `400 ${tam}px 'Montserrat', -apple-system, 'Helvetica Neue', Arial, sans-serif`;
          const ancho = Math.ceil(sctx.measureText(cifra).width) + margen * 2;
          const alto = Math.ceil(tam * 1.4) + margen * 2;
          s.width = ancho * dpr;
          s.height = alto * dpr;
          sctx.scale(dpr, dpr);
          if (borron > 0.2) sctx.filter = `blur(${borron}px)`;
          sctx.font = `400 ${tam}px 'Montserrat', -apple-system, 'Helvetica Neue', Arial, sans-serif`;
          sctx.textAlign = 'center';
          sctx.textBaseline = 'middle';
          sctx.fillStyle = '#c8a35c';
          sctx.fillText(cifra, ancho / 2, alto / 2);
          fila.push(s);
        }
        sellos.push(fila);
      }
    };

    const nuevo = (yAlAzar: boolean): Num => {
      const capa = Math.floor(Math.random() * CAPAS);
      return {
        x: Math.random() * w,
        y: yAlAzar ? Math.random() * h : h + 50,
        vx: (Math.random() - 0.5) * 0.07,
        vy: -(0.04 + capa * 0.028),
        capa,
        cifra: Math.floor(Math.random() * CIFRAS.length),
        fase: Math.random() * Math.PI * 2,
        vaiven: 0.25 + Math.random() * 0.7,
        giro: (Math.random() - 0.5) * 0.22,
      };
    };

    const montar = () => {
      const r = c.getBoundingClientRect();
      w = r.width;
      h = r.height;
      /* En una pantalla grande y con retina el lienzo se iría a cinco millones
         de píxeles que hay que borrar y repintar treinta veces por segundo. Con
         cifras doradas, desenfocadas y a poca opacidad, la resolución de más no
         se ve: se ve el trabajo que cuesta. */
      const tope = 2_000_000;
      const escala = Math.min(dpr, Math.sqrt(tope / Math.max(1, w * h)));
      c.width = Math.round(w * escala);
      c.height = Math.round(h * escala);
      ctx.setTransform(escala, 0, 0, escala, 0, 0);
      const n = Math.max(22, Math.min(72, Math.round((w * h) / densidad)));
      nums = Array.from({ length: n }, () => nuevo(true));

      /* Si al cambiar el tamaño de la ventana las cifras tienen que ser otras
         —girar el teléfono, arrastrar el borde—, se vuelven a dibujar. Solo
         entonces: rehacer ochenta y cuatro sellos en cada píxel de resize
         costaría más que todo lo demás junto. */
      if (Math.abs(escalaCifras() - escalaSellos) > 0.02) prepararSellos();
    };

    prepararSellos();
    montar();
    window.addEventListener('resize', montar);

    // Cuando el hero deja de verse, el canvas deja de pintar: no tiene sentido
    // gastar frames en algo que está fuera de pantalla.
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(c);

    let raton = { x: -9999, y: -9999 };
    const alMover = (e: MouseEvent) => {
      const r = c.getBoundingClientRect();
      raton = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const alSalir = () => (raton = { x: -9999, y: -9999 });
    window.addEventListener('mousemove', alMover, { passive: true });
    window.addEventListener('mouseleave', alSalir);

    /* Mientras se baja, el campo se para. Se vuelve a mover 140 ms después del
       último movimiento de la rueda o del dedo. */
    let bajando = false;
    let temporizador: ReturnType<typeof setTimeout>;
    const alBajar = () => {
      bajando = true;
      clearTimeout(temporizador);
      temporizador = setTimeout(() => (bajando = false), 140);
    };
    window.addEventListener('scroll', alBajar, { passive: true });

    const pintar = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nums) {
        const s = sellos[n.capa]?.[n.cifra];
        if (!s) continue;
        const aw = s.width / dpr;
        const ah = s.height / dpr;
        ctx.globalAlpha = alfaDe(n.capa);
        if (n.giro) {
          ctx.save();
          ctx.translate(n.x, n.y);
          ctx.rotate(n.giro);
          ctx.drawImage(s, -aw / 2, -ah / 2, aw, ah);
          ctx.restore();
        } else {
          ctx.drawImage(s, n.x - aw / 2, n.y - ah / 2, aw, ah);
        }
      }
      ctx.globalAlpha = 1;
    };

    const soltar = () => {
      clearTimeout(temporizador);
      io.disconnect();
      window.removeEventListener('resize', montar);
      window.removeEventListener('mousemove', alMover);
      window.removeEventListener('mouseleave', alSalir);
      window.removeEventListener('scroll', alBajar);
    };

    if (quieto) {
      pintar();
      return soltar;
    }

    let raf = 0;
    let ultimo = 0;
    const paso = (t: number) => {
      raf = requestAnimationFrame(paso);
      if (!visible || bajando) return;
      // 30 fps bastan para una deriva tan lenta, y deja la mitad de la máquina
      // libre para el desplazamiento de la página.
      if (t - ultimo < 33) return;
      ultimo = t;

      const t2 = t / 1000;
      for (let i = 0; i < nums.length; i++) {
        const n = nums[i];
        // Un vaivén lento y distinto en cada uno: suben en ese, no en línea recta.
        n.x += n.vx + Math.sin(t2 * 0.32 + n.fase) * 0.06 * n.vaiven;
        n.y += n.vy;

        const dx = n.x - raton.x;
        const dy = n.y - raton.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 26000) {
          const d = Math.sqrt(d2) || 1;
          const f = ((26000 - d2) / 26000) * (0.5 + n.capa * 0.4);
          n.x += (dx / d) * f;
          n.y += (dy / d) * f;
        }

        if (n.y < -60) nums[i] = nuevo(false);
        if (n.x < -60) n.x = w + 60;
        if (n.x > w + 60) n.x = -60;
      }
      pintar();
    };
    raf = requestAnimationFrame(paso);

    return () => {
      cancelAnimationFrame(raf);
      soltar();
    };
  }, [densidad, intensidad]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
        // Su propia capa: repintar los números no obliga a repintar el titular
        // ni la foto que tienen detrás.
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    />
  );
}
