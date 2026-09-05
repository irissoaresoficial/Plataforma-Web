/**
 * Los iconos van dibujados a mano en SVG en lugar de traer una librería: pesan
 * nada y heredan el color del sitio donde se pongan.
 *
 * Y son de esta plataforma, no de cualquiera. Antes eran los de siempre —
 * cuatro cuadrados para el resumen, una almohadilla para los números, un reloj
 * para los ciclos — y podían estar en cualquier panel de control del mundo.
 * Ahora cada uno dibuja la cosa que abre: el árbol dibuja sus tres columnas de
 * sefirot, la imagen del alma su tabla de nueve casillas con una bloqueada, los
 * ciclos la rueda de nueve años con el tramo en curso marcado.
 */
type P = { size?: number };

const trazo = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Caja({ size = 20, children }: P & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...trazo}>
      {children}
    </svg>
  );
}

/** La semilla de la vida: el estudio entero visto de una vez. */
export const IcoResumen = (p: P) => (
  <Caja {...p}>
    <circle cx="12" cy="12" r="4.1" />
    <circle cx="12" cy="7.6" r="4.1" opacity=".55" />
    <circle cx="8.2" cy="14.2" r="4.1" opacity=".55" />
    <circle cx="15.8" cy="14.2" r="4.1" opacity=".55" />
  </Caja>
);

/** El Árbol de la Vida con sus tres columnas. */
export const IcoArbol = (p: P) => (
  <Caja {...p}>
    <path d="M12 3.4v17.2M6.6 8.2 12 3.4l5.4 4.8M6.6 8.2v7.6L12 20.6l5.4-4.8V8.2M6.6 15.8 17.4 8.2M17.4 15.8 6.6 8.2" opacity=".5" />
    <circle cx="12" cy="3.4" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="6.6" cy="8.2" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="17.4" cy="8.2" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="6.6" cy="15.8" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="17.4" cy="15.8" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
    <circle cx="12" cy="20.6" r="1.5" fill="currentColor" stroke="none" />
  </Caja>
);

/** Reducir: varias cifras que caen a una sola. */
export const IcoNumeros = (p: P) => (
  <Caja {...p}>
    <circle cx="6" cy="5.4" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="5.4" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="18" cy="5.4" r="1.5" fill="currentColor" stroke="none" />
    <path d="M6 8.6q0 4 6 4t6-4" opacity=".55" />
    <path d="M12 12.6v5" opacity=".55" />
    <circle cx="12" cy="19" r="2.3" />
  </Caja>
);

/** La figura con sus diez portales, cinco a cada lado. */
export const IcoEstructura = (p: P) => (
  <Caja {...p}>
    <path d="M12 6.6v8M9.6 21l2.4-6.4 2.4 6.4" opacity=".55" />
    <circle cx="12" cy="4" r="2" />
    <circle cx="7.6" cy="8.4" r="1.35" fill="currentColor" stroke="none" />
    <circle cx="16.4" cy="8.4" r="1.35" fill="currentColor" stroke="none" />
    <circle cx="7.6" cy="12.8" r="1.35" fill="currentColor" stroke="none" />
    <circle cx="16.4" cy="12.8" r="1.35" fill="currentColor" stroke="none" />
  </Caja>
);

/** La tabla de los diez planos, con uno bloqueado. */
export const IcoAlma = (p: P) => (
  <Caja {...p}>
    <rect x="3.2" y="3.2" width="17.6" height="13.4" rx="2.4" />
    <path d="M9.1 3.2v13.4M14.9 3.2v13.4M3.2 7.7h17.6M3.2 12.1h17.6" opacity=".55" />
    <rect x="9.1" y="7.7" width="5.8" height="4.4" fill="currentColor" stroke="none" opacity=".9" />
    <path d="M7.4 20.4h9.2" />
  </Caja>
);

/** Las tres filas de la ficha y la columna de totales. */
export const IcoCuentas = (p: P) => (
  <Caja {...p}>
    <rect x="3.2" y="4.4" width="17.6" height="15.2" rx="2.4" />
    <path d="M3.2 9.5h17.6M3.2 14.5h17.6M15.4 4.4v15.2" opacity=".55" />
    <circle cx="18.1" cy="7" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="18.1" cy="12" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="18.1" cy="17" r="1.15" fill="currentColor" stroke="none" />
  </Caja>
);

/** La rueda de nueve años, con el tramo en curso encendido. */
export const IcoCiclos = (p: P) => (
  <Caja {...p}>
    <circle cx="12" cy="12" r="8.6" opacity=".5" />
    <path d="M12 3.4a8.6 8.6 0 0 1 7.45 4.3" strokeWidth="2.4" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <path d="M12 10.4V6.2" opacity=".55" />
  </Caja>
);

/** El bagua: el octógono del feng shui, con el tao en el centro. */
export const IcoFengShui = (p: P) => (
  <Caja {...p}>
    <path d="M8.6 2.9h6.8l4.7 4.7v6.8l-4.7 4.7H8.6l-4.7-4.7V7.6z" />
    <path d="M8.6 2.9v18.2M15.4 2.9v18.2M3.9 7.6h16.2M3.9 16.4h16.2" opacity=".4" />
    <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" opacity=".9" />
  </Caja>
);

/** La tetraktys: diez puntos en cuatro filas, el emblema pitagórico. */
export const IcoNumerologia = (p: P) => (
  <Caja {...p}>
    <circle cx="12" cy="4.4" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="9" cy="9.2" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="15" cy="9.2" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="6" cy="14" r="1.4" fill="currentColor" stroke="none" opacity=".8" />
    <circle cx="12" cy="14" r="1.4" fill="currentColor" stroke="none" opacity=".8" />
    <circle cx="18" cy="14" r="1.4" fill="currentColor" stroke="none" opacity=".8" />
    <circle cx="3" cy="18.8" r="1.4" fill="currentColor" stroke="none" opacity=".6" />
    <circle cx="9" cy="18.8" r="1.4" fill="currentColor" stroke="none" opacity=".6" />
    <circle cx="15" cy="18.8" r="1.4" fill="currentColor" stroke="none" opacity=".6" />
    <circle cx="21" cy="18.8" r="1.4" fill="currentColor" stroke="none" opacity=".6" />
  </Caja>
);

/** Plegar y desplegar la columna de la izquierda. */
export const IcoPlegar = ({ abierto = true, ...p }: P & { abierto?: boolean }) => (
  <Caja {...p}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M9.4 4v16" />
    <path d={abierto ? "M17 9.6 14.4 12l2.6 2.4" : "M14 9.6 16.6 12 14 14.4"} opacity=".7" />
  </Caja>
);

/** Un lápiz pequeño: marca lo que se puede reescribir. */
export const IcoEditar = (p: P) => (
  <Caja {...p}>
    <path d="M4 20h4.2l9.4-9.4a2.1 2.1 0 0 0 0-3l-1.2-1.2a2.1 2.1 0 0 0-3 0L4 15.8z" />
    <path d="M13.6 5.8 18.2 10.4" opacity=".55" />
  </Caja>
);
