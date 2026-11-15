"use client";

/**
 * DESDE UN ESTUDIO, A LA FICHA DE SU PERSONA.
 *
 * Una línea que va en cualquier estudio —Kábala, Numerología, Feng Shui o una
 * pareja— y contesta «¿de quién es esto?» con lo que hay en Personas:
 *
 *   · Atado a una ficha que existe → «Ver su ficha».
 *   · Sin atar, y hay fichas con ese nombre → «¿Es de Ana Gil? Sí, unir».
 *   · Sin atar y sin nadie parecido → «Crearle la ficha», con el nombre y la
 *     fecha del estudio.
 *
 * NADA SE ATA NI SE CREA SOLO. Que dos personas se llamen igual pasa, y un
 * estudio atado a la ficha equivocada es un error que no se ve: por eso cada
 * cosa la decide Iris con un botón.
 */
import { useEffect, useMemo, useState } from "react";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { BOTON_PLANO, NOTA } from "@/lib/ui";
import { titulo as enTitulo } from "@/lib/format";
import { clientes as repoClientes, nuevoId, sinTildes, type Cliente } from "@/lib/despacho";
import { llaveDeCorreo } from "@/lib/despacho/personas";

/** Se parecen si uno contiene al otro, sin tildes ni mayúsculas. */
export function seParecen(a: string, b: string): boolean {
  const x = sinTildes(a).trim();
  const y = sinTildes(b).trim();
  if (x.length < 3 || y.length < 3) return false;
  return x.includes(y) || y.includes(x);
}

/** «3/7/1988» → «1988-07-03». Si no es una fecha completa, nada. */
export function nacimientoDe(dia?: string, mes?: string, anio?: string): string | undefined {
  const d = Number(dia), m = Number(mes), a = Number(anio);
  if (!d || !m || !a || a < 1000) return undefined;
  return `${a}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function SuFicha({
  nombre,
  nacimiento,
  clienteId,
  alUnir,
}: {
  /** El nombre tal cual sale en el estudio. */
  nombre: string;
  nacimiento?: string;
  clienteId: string | null | undefined;
  /** Se llama con el id de la ficha cuando Iris la une o la crea. */
  alUnir: (clienteId: string) => void;
}) {
  const { setView, setClienteAbierto } = useApp();
  const [todas, setTodas] = useState<Cliente[] | null>(null);
  const [error, setError] = useState("");
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    let vivo = true;
    repoClientes
      .listar()
      .then((xs) => vivo && setTodas(xs))
      .catch(() => vivo && setTodas([]));
    return () => {
      vivo = false;
    };
  }, [clienteId]);

  const suya = useMemo(() => (clienteId ? todas?.find((c) => c.id === clienteId) ?? null : null), [todas, clienteId]);
  const parecidas = useMemo(() => (todas ?? []).filter((c) => seParecen(c.nombre, nombre)).slice(0, 3), [todas, nombre]);

  const verFicha = (c: Cliente) => {
    setClienteAbierto(llaveDeCorreo(c.email) || c.id);
    setView("personas");
  };

  const crear = async () => {
    setCreando(true);
    setError("");
    try {
      const ahora = new Date().toISOString();
      const c = await repoClientes.guardar({
        id: nuevoId(),
        nombre: enTitulo(nombre),
        email: "",
        origen: "plataforma",
        etiquetas: [],
        consentimiento: null,
        notas: [],
        ...(nacimiento ? { nacimiento } : {}),
        creada: ahora,
        actualizada: ahora,
      });
      setTodas((xs) => [...(xs ?? []), c]);
      alUnir(c.id);
    } catch (e) {
      /* Nada dice «creada» si no se ha creado. */
      setError(e instanceof Error ? e.message : "No se ha podido crear la ficha.");
    } finally {
      setCreando(false);
    }
  };

  if (todas === null || !nombre.trim()) return null;

  const fila = "display:flex;align-items:center;gap:var(--s2);flex-wrap:wrap;";
  return (
    <div data-chrome="1" style={css("display:flex;flex-direction:column;gap:var(--s2);")}>
      {suya ? (
        <div style={css(fila)}>
          <span style={css(NOTA)}>Es de la ficha de {enTitulo(suya.nombre)}.</span>
          <button type="button" onClick={() => verFicha(suya)} style={css(BOTON_PLANO)}>
            Ver su ficha
          </button>
        </div>
      ) : (
        <>
          {parecidas.map((c) => (
            <div key={c.id} style={css(fila)}>
              <span style={css(NOTA)}>¿Es de {enTitulo(c.nombre)}?</span>
              <button type="button" onClick={() => alUnir(c.id)} style={css(BOTON_PLANO)}>
                Sí, unirlo a su ficha
              </button>
            </div>
          ))}
          <div style={css(fila)}>
            <span style={css(NOTA)}>{parecidas.length ? "¿Es otra persona?" : "Todavía no tiene ficha en Personas."}</span>
            <button type="button" onClick={crear} disabled={creando} style={css(BOTON_PLANO)}>
              {creando ? "Creando…" : "Crearle la ficha"}
            </button>
          </div>
        </>
      )}
      {error && <span style={css(NOTA + "color:var(--red);")}>{error}</span>}
    </div>
  );
}
