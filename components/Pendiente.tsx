import { PENDIENTE } from '@/content/site';

/** Etiqueta roja para todo lo que aún no tiene contenido real. */
export default function Pendiente({ children = PENDIENTE }: { children?: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        color: '#A33B3B',
        border: '1px solid #A33B3B',
        borderRadius: 100,
        padding: '3px 9px',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

/** Devuelve el texto, o la etiqueta de pendiente si todavía no hay contenido. */
export function Texto({ valor, children }: { valor: string; children?: React.ReactNode }) {
  if (valor === PENDIENTE || !valor) return <Pendiente />;
  return <>{children ?? valor}</>;
}

/**
 * El hueco que deja un texto que todavía no está escrito.
 *
 * La etiqueta roja sola no basta cuando lo que falta es un titular: la columna
 * se queda vacía y la página no parece incompleta, parece rota. Esto guarda el
 * sitio con unas barras del alto que tendrá el texto de verdad, así se ve de un
 * vistazo cuánto va a ocupar cuando se rellene.
 */
export function Hueco({
  lineas = 1,
  alto = 20,
  etiqueta = PENDIENTE,
}: {
  /** Cuántas líneas ocupará el texto que falta. */
  lineas?: number;
  /** Alto de cada línea en píxeles, más o menos el del texto definitivo. */
  alto?: number;
  etiqueta?: string;
}) {
  // La última línea sale más corta, como acaba cualquier párrafo de verdad.
  const anchos = Array.from({ length: lineas }, (_, i) => (i === lineas - 1 && lineas > 1 ? '58%' : '100%'));
  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      {/* La etiqueta se queda de su tamaño; las barras ocupan el ancho. */}
      <span style={{ alignSelf: 'flex-start' }}>
        <Pendiente>{etiqueta}</Pendiente>
      </span>
      <span aria-hidden style={{ display: 'flex', flexDirection: 'column', gap: Math.round(alto * 0.34), width: '100%' }}>
        {anchos.map((w, i) => (
          <span
            key={i}
            style={{
              display: 'block',
              width: w,
              height: alto,
              borderRadius: alto / 3,
              background: 'var(--linea)',
            }}
          />
        ))}
      </span>
    </span>
  );
}
