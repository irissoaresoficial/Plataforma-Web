"use client";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";

/**
 * La tarjeta de la que cuelga todo el panel. Existe para que el relleno, el
 * borde y la sombra se decidan en un solo sitio: antes cada sección repetía la
 * misma tira de CSS y bastaba con que una se despistara para que el ritmo
 * vertical dejara de cuadrar.
 *
 * `anclado` es para las láminas de referencia — el árbol, el cuerpo, la tabla
 * del alma —, que son cortas y quedan al lado de una columna de texto muy
 * larga: en vez de dejar media pantalla en blanco, acompañan a la lectura.
 */
export default function Lienzo({
  children,
  anclado,
  compacto,
  acento,
  alza,
  className,
}: {
  children: React.ReactNode;
  anclado?: boolean;
  compacto?: boolean;
  acento?: boolean;
  alza?: boolean;
  className?: string;
}) {
  const quieto = useReducedMotion();
  return (
    <motion.section
      className={className}
      data-alza={alza ? "" : undefined}
      data-anclado={anclado ? "" : undefined}
      initial={quieto ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={css(
        "background:var(--surface);border:1px solid var(--border);" +
          (acento ? "border-left:2px solid var(--gold);" : "") +
          "border-radius:var(--r);padding:" +
          (compacto ? "var(--pad-card-sm)" : "var(--pad-card)") +
          ";min-width:0;" +
          (anclado ? "position:sticky;top:78px;align-self:start;max-height:calc(100vh - 96px);overflow-y:auto;" : "")
      )}
    >
      {children}
    </motion.section>
  );
}
