"use client";

/**
 * ============================================================================
 * «ESTO QUE VES ES UN EJEMPLO»
 * ============================================================================
 *
 * Gerson pidió terminar toda la interfaz primero y cablearla después. Es una
 * forma sensata de trabajar —se ve el conjunto antes de decidir qué datos hace
 * falta guardar— pero tiene un peligro concreto y éste es el que lo tapa:
 *
 * UNA PANTALLA CON DATOS DE MENTIRA ES INDISTINGUIBLE DE UNA CON DATOS DE
 * VERDAD. Iris entra en Métricas, lee «148 personas este mes» y se lo cree. Y
 * si se lo cree, decide con ello: dónde anuncia, qué curso repite, cuánto
 * cobra. Un número inventado que alguien usa para decidir hace más daño que
 * una pantalla vacía.
 *
 * Así que todo lo que todavía no está conectado lo lleva escrito encima, con
 * estas tres reglas:
 *
 *   · ARRIBA DEL TODO, no al pie. Al pie se lee después de haberse creído los
 *     números, que es tarde.
 *   · DICE QUÉ PASA Y QUÉ FALTA, no «beta» ni «próximamente», que no informan
 *     de nada.
 *   · SE QUITA AL CONECTAR. Cada pantalla que se cablea pierde su aviso. El
 *     día que no quede ninguno, este archivo se borra.
 */

import { css } from "@/lib/css";
import { NOTA } from "@/lib/ui";

export default function Muestra({ falta }: { falta: string }) {
  return (
    <p
      role="note"
      style={css(
        "display:flex;gap:10px;align-items:flex-start;margin:0;padding:11px 14px;" +
          "border-radius:var(--r-sm);border:1px dashed var(--border);" +
          "background:color-mix(in srgb, var(--text) 3%, transparent);" +
          NOTA +
          "line-height:1.55;max-width:76ch;"
      )}
    >
      <span aria-hidden style={css("flex:none;color:var(--gold-deep, var(--text-3));")}>◻</span>
      <span>
        <strong style={css("color:var(--text-2);")}>Los datos de esta pantalla son de ejemplo.</strong> Está hecha la
        parte de verle la cara; falta conectarla. {falta}
      </span>
    </p>
  );
}
