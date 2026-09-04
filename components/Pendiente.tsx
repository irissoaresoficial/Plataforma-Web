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
