"use client";
import { useEffect, useRef } from "react";
import { css } from "@/lib/css";

/**
 * Polvo dorado suspendido en el aire.
 *
 * Va en canvas y no en decenas de nodos animados por CSS: son partículas que
 * se mueven todas a la vez, y así el navegador pinta un solo elemento en lugar
 * de recalcular la disposición de la página.
 *
 * Lo que hace que se lea como polvo y no como una lluvia de puntos:
 *
 *   · cada mota tiene una profundidad. Las de delante son mayores, más claras
 *     y suben más deprisa; las del fondo son casi un velo. Eso da relieve sin
 *     necesidad de más partículas — con la mitad se ve mejor que antes;
 *   · no suben rectas: se balancean. Un seno muy lento y desfasado por mota,
 *     con más recorrido en las de delante, que es como se mueve algo ligero
 *     dentro de una corriente de aire;
 *   · el titileo es lento y suave, nada de parpadeo;
 *   · y todo entra fundiendo desde negro durante el primer segundo y medio, en
 *     vez de aparecer de golpe con la página.
 *
 * Se queda quieto si el sistema pide menos movimiento, y también cuando no
 * está a la vista: no tiene sentido gastar cuadros en algo que nadie mira.
 */
export default function Particulas({ cantidad = 26, color }: { cantidad?: number; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const lienzo = ref.current;
    if (!lienzo) return;
    const ctx = lienzo.getContext("2d");
    if (!ctx) return;

    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Sobre fondo oscuro el dorado tostado desaparece: hay que subirlo de luz,
    // igual que se hace con el token de color.
    const oscuro = document.documentElement.dataset.tema === "oscuro";
    const tinta = color || (oscuro ? "236,214,150" : "176,142,52");

    let ancho = 0;
    let alto = 0;
    let visible = true;
    let cuadro = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const motas = Array.from({ length: cantidad }, () => {
      // 0 = al fondo, 1 = delante del todo. Manda en el tamaño, en la luz y en
      // la velocidad, que es lo que da la sensación de profundidad.
      const z = Math.pow(Math.random(), 1.6);
      return {
        x: Math.random(),
        y: Math.random(),
        z,
        r: 0.5 + z * 1.5,
        // Sube, muy despacio, y las de delante algo más.
        vy: -(0.006 + z * 0.014),
        // El vaivén: amplitud y ritmo propios para que no ondeen a la vez.
        vaiven: (0.004 + z * 0.014) * (Math.random() < 0.5 ? -1 : 1),
        ritmo: 0.12 + Math.random() * 0.22,
        fase: Math.random() * Math.PI * 2,
        brillo: (oscuro ? 0.22 : 0.18) + z * (oscuro ? 0.5 : 0.42),
      };
    });

    const medir = () => {
      const c = lienzo.getBoundingClientRect();
      ancho = c.width;
      alto = c.height;
      lienzo.width = Math.round(ancho * dpr);
      lienzo.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    medir();

    const observador = new ResizeObserver(medir);
    observador.observe(lienzo);

    const enPantalla = new IntersectionObserver((e) => (visible = e[0].isIntersecting), { threshold: 0 });
    enPantalla.observe(lienzo);

    /** Una mota, con su halo. Sin halo se ven como puntos duros de alfiler. */
    const mota = (x: number, y: number, radio: number, alfa: number) => {
      const halo = ctx.createRadialGradient(x, y, 0, x, y, radio);
      halo.addColorStop(0, `rgba(${tinta},${alfa.toFixed(3)})`);
      halo.addColorStop(0.4, `rgba(${tinta},${(alfa * 0.4).toFixed(3)})`);
      halo.addColorStop(1, `rgba(${tinta},0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, radio, 0, Math.PI * 2);
      ctx.fill();
    };

    // En segundos, y medido de reloj: así se mueve igual en una pantalla de 60
    // que en una de 120, y no da un salto al volver de otra pestaña.
    let t = 0;
    let previo = performance.now();
    const ENTRADA = 1.4;

    const pintar = (ahora: number) => {
      cuadro = requestAnimationFrame(pintar);
      const dt = Math.min((ahora - previo) / 1000, 0.05);
      previo = ahora;
      if (!visible || ancho === 0) return;
      if (!quieto) t += dt;

      // Se apaga entero y vuelve a encenderse: el fundido de entrada.
      const entrada = quieto ? 1 : Math.min(t / ENTRADA, 1);
      ctx.clearRect(0, 0, ancho, alto);

      for (const m of motas) {
        if (!quieto) {
          m.y += m.vy * dt;
          // Al salir por arriba vuelve a entrar por abajo, en otra columna.
          if (m.y < -0.06) {
            m.y = 1.06;
            m.x = Math.random();
          }
        }
        const x = (m.x + Math.sin(t * m.ritmo + m.fase) * m.vaiven) * ancho;
        const y = m.y * alto;
        const titileo = 0.78 + 0.22 * Math.sin(t * m.ritmo * 1.7 + m.fase);
        mota(x, y, m.r * 3.2, m.brillo * titileo * entrada);
      }
    };
    cuadro = requestAnimationFrame(pintar);

    return () => {
      cancelAnimationFrame(cuadro);
      observador.disconnect();
      enPantalla.disconnect();
    };
  }, [cantidad, color]);

  return <canvas ref={ref} aria-hidden="true" style={css("position:absolute;inset:0;width:100%;height:100%;pointer-events:none;border-radius:inherit;")} />;
}
