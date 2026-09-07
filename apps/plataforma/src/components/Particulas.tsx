"use client";
import { useEffect, useRef, useState } from "react";
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
  /*
   * EL POLVO CAMBIA DE COLOR CUANDO CAMBIA EL TEMA.
   *
   * El color se leía de `data-tema` una sola vez, al montar, y el efecto no
   * dependía de nada que cambiara: al darle al botón de la luna la página
   * entera se daba la vuelta y las motas se quedaban del color de la cara
   * anterior — polvo negro flotando sobre el granate del modo oscuro, donde
   * sencillamente desaparecía.
   *
   * Aquí se vigila el atributo y se vuelve a montar el lienzo cuando cambia.
   * Es lo mismo que hacen los tokens de CSS, sólo que un canvas no se entera
   * solo: hay que decírselo.
   */
  const [tema, setTema] = useState(() =>
    typeof document === "undefined" ? "claro" : document.documentElement.dataset.tema || "claro"
  );

  useEffect(() => {
    const vigia = new MutationObserver(() => setTema(document.documentElement.dataset.tema || "claro"));
    vigia.observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
    return () => vigia.disconnect();
  }, []);

  useEffect(() => {
    const lienzo = ref.current;
    if (!lienzo) return;
    const ctx = lienzo.getContext("2d");
    if (!ctx) return;

    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /*
     * EN CLARO, POLVO NEGRO. EN OSCURO, POLVO DORADO.
     *
     * Las motas eran doradas en las dos caras. Sobre el granate del modo oscuro
     * eso funciona —el oro es lo único que se recorta contra ese fondo—, pero
     * sobre la plataforma blanca un dorado claro sobre papel claro es casi el
     * papel: había partículas y no se veían. Toda la atmósfera se perdía justo
     * en la cara que se usa de día.
     *
     * En claro son tinta: el mismo marrón oscuro del texto, muy rebajado. Se
     * ven, no distraen, y siguen siendo de esta casa — un negro puro sobre
     * papel cálido se ve azulado y ajeno.
     */
    const oscuro = tema === "oscuro";
    const tinta = color || (oscuro ? "236,214,150" : "34,29,31");

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
        brillo: (oscuro ? 0.22 : 0.1) + z * (oscuro ? 0.5 : 0.26),
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

    /*
     * EL RATÓN APARTA EL POLVO.
     *
     * Es lo que convierte un fondo bonito en un fondo que responde: al pasar
     * por encima, las motas cercanas se separan un poco y vuelven solas a lo
     * suyo. No es un efecto de partículas persiguiendo el cursor —eso llama la
     * atención sobre sí mismo y estorba— sino aire desplazado: se nota, no se
     * mira.
     *
     * El puntero se escucha en la ventana y no en el lienzo porque el lienzo no
     * recibe pulsaciones (`pointer-events:none`, para no robárselas a lo que
     * hay encima). Se guarda en coordenadas del propio lienzo.
     *
     * Sólo el ratón: en una pantalla táctil no hay puntero flotando, y hacerlo
     * responder al dedo mientras se hace scroll sería ruido.
     */
    const puntero = { x: -999, y: -999, dentro: false };
    const RADIO = 110;
    const FUERZA = 26;
    const mueveRaton = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const c = lienzo.getBoundingClientRect();
      puntero.x = e.clientX - c.left;
      puntero.y = e.clientY - c.top;
      puntero.dentro = puntero.x > -RADIO && puntero.x < c.width + RADIO && puntero.y > -RADIO && puntero.y < c.height + RADIO;
    };
    const salePuntero = () => (puntero.dentro = false);
    if (!quieto) {
      window.addEventListener("pointermove", mueveRaton, { passive: true });
      window.addEventListener("pointerleave", salePuntero);
    }

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
        let x = (m.x + Math.sin(t * m.ritmo + m.fase) * m.vaiven) * ancho;
        let y = m.y * alto;

        /* El empuje del ratón. Cae con el cuadrado de la distancia y las motas
           de delante —las grandes— se apartan más que las del fondo, que es lo
           que hace que el desplazamiento se lea como profundidad y no como un
           agujero recortado en el polvo. */
        if (puntero.dentro) {
          const dx = x - puntero.x;
          const dy = y - puntero.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < RADIO * RADIO && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const empuje = (1 - d / RADIO) ** 2 * FUERZA * (0.4 + m.z);
            x += (dx / d) * empuje;
            y += (dy / d) * empuje;
          }
        }

        const titileo = 0.78 + 0.22 * Math.sin(t * m.ritmo * 1.7 + m.fase);
        mota(x, y, m.r * 3.2, m.brillo * titileo * entrada);
      }
    };
    cuadro = requestAnimationFrame(pintar);

    return () => {
      cancelAnimationFrame(cuadro);
      observador.disconnect();
      enPantalla.disconnect();
      window.removeEventListener("pointermove", mueveRaton);
      window.removeEventListener("pointerleave", salePuntero);
    };
  }, [cantidad, color, tema]);

  return <canvas ref={ref} aria-hidden="true" style={css("position:absolute;inset:0;width:100%;height:100%;pointer-events:none;border-radius:inherit;")} />;
}
