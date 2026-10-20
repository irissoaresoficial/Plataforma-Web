"use client";

/**
 * ============================================================================
 * TUS PRIMEROS PASOS: LOS TROFEOS DE EMPEZAR
 * ============================================================================
 *
 * Gerson, el 20 de octubre de 2026: «que puedan llenar ciertos puntos o
 * ciertos trofeos: llenar su cuenta, su foto, comentar en la escuela…».
 *
 * Es una lista corta de lo que hace que alguien se quede: poner cara, hablar
 * en la comunidad, empezar. Cada paso da puntos y se tacha solo cuando se
 * hace, porque SE MIRA LO QUE HAY: la foto en su ficha, sus mensajes en la
 * comunidad, sus cursos. No hay un botón de «ya lo he hecho» que se pueda
 * pulsar sin hacerlo.
 *
 * Los pasos dependen de las llaves: a un creador se le pide montar su curso;
 * a un alumno, terminar su primera lección.
 */
import { useEffect, useState } from "react";
import { css } from "@/lib/css";
import { useApp, type View } from "@/lib/app-context";
import { useSesion } from "@/lib/sesion";
import { TARJETA } from "@/lib/ui";
import { avance as repoAvance, cursos as repoCursos, inscripciones as repoInscripciones } from "@/lib/escuela";
import { listaTemas, todasLasRespuestas } from "@/lib/escuela/comunidad";

type Paso = { k: string; que: string; puntos: number; hecho: boolean; ir: View };

export default function PrimerosPasos() {
  const { usuario, puede } = useSesion();
  const { setView } = useApp();
  const [pasos, setPasos] = useState<Paso[] | null>(null);
  const uid = usuario ? usuario.uid : "";
  const foto = usuario ? Boolean(usuario.foto) : false;

  useEffect(() => {
    if (!uid) return;
    let vivo = true;
    (async () => {
      const comunidad = puede("comunidad");
      const creador = puede("crear") && !puede("despacho");
      const alumno = puede("cursos") && !creador;
      const [temas, respuestas, propios, ins] = await Promise.all([
        comunidad ? listaTemas().catch(() => []) : Promise.resolve([]),
        comunidad ? todasLasRespuestas().catch(() => []) : Promise.resolve([]),
        creador ? repoCursos.deAutor(uid).catch(() => []) : Promise.resolve([]),
        alumno ? repoInscripciones.deAlumno(uid).catch(() => []) : Promise.resolve([]),
      ]);
      const avs = alumno ? await Promise.all(ins.map((i) => repoAvance.de(uid, i.cursoId).catch(() => null))) : [];

      const xs: Paso[] = [{ k: "foto", que: "Pon tu foto en tu perfil", puntos: 10, hecho: foto, ir: "perfil" }];
      if (comunidad) {
        xs.push({ k: "tema", que: "Deja tu primer comentario en la comunidad", puntos: 10, hecho: temas.some((t) => t.uid === uid), ir: "comunidad" });
        xs.push({ k: "resp", que: "Responde a alguien en la comunidad", puntos: 5, hecho: respuestas.some((r) => r.uid === uid), ir: "comunidad" });
      }
      if (creador) {
        xs.push({ k: "curso", que: "Crea tu primer curso", puntos: 20, hecho: propios.length > 0, ir: "cursos" });
        xs.push({
          k: "clase",
          que: "Sube tu primera clase",
          puntos: 20,
          hecho: propios.some((c) => c.modulos.some((m) => m.lecciones.some((l) => l.video))),
          ir: "cursos",
        });
        xs.push({ k: "publicar", que: "Pide que se publique", puntos: 10, hecho: propios.some((c) => c.revision || c.publicado), ir: "cursos" });
      }
      if (alumno) {
        xs.push({ k: "leccion", que: "Termina tu primera lección", puntos: 10, hecho: avs.some((a) => (a?.hechas.length ?? 0) > 0), ir: "cursos" });
      }
      if (vivo) setPasos(xs);
    })();
    return () => {
      vivo = false;
    };
  }, [uid, foto, puede]);

  if (!pasos) return null;
  const total = pasos.reduce((s, p) => s + p.puntos, 0);
  const llevas = pasos.filter((p) => p.hecho).reduce((s, p) => s + p.puntos, 0);
  const todo = llevas === total;

  return (
    <section style={css(TARJETA + "padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s3);")}>
      <div style={css("display:flex;align-items:flex-end;justify-content:space-between;gap:var(--s3);flex-wrap:wrap;")}>
        <div>
          <h2 style={css("margin:0;font-size:var(--t-head);font-weight:500;letter-spacing:-.025em;")}>
            {todo ? "Ya tienes tu medalla de bienvenida" : "Tus primeros pasos"}
          </h2>
          <p style={css("margin:4px 0 0;font-size:var(--t-body);color:var(--text-3);")}>
            {todo ? "Has hecho todo lo de empezar. Ahora, a lo de verdad." : "Cada paso suma puntos. Al completarlos todos, ganas tu medalla de bienvenida."}
          </p>
        </div>
        <div style={css("display:flex;align-items:baseline;gap:6px;")}>
          <span style={css("font-weight:300;font-size:44px;letter-spacing:-.04em;line-height:1;font-variant-numeric:tabular-nums;")}>{llevas}</span>
          <span style={css("font-size:var(--t-body);color:var(--text-3);")}>/ {total} puntos</span>
        </div>
      </div>
      <div style={css("height:8px;border-radius:var(--r-pill);background:var(--surface-2);overflow:hidden;")}>
        <div style={css(`height:100%;width:${(llevas / total) * 100}%;border-radius:var(--r-pill);background:linear-gradient(90deg,var(--vino),var(--oro));transition:width var(--t-lento) var(--curva);`)} />
      </div>
      <ul style={css("list-style:none;margin:0;padding:0;display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));")}>
        {pasos.map((p) => (
          <li key={p.k}>
            <button
              onClick={() => setView(p.ir)}
              disabled={p.hecho}
              style={css(
                "width:100%;display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:var(--r-lg);font:inherit;text-align:left;" +
                  (p.hecho
                    ? "background:var(--accion-suave);border:1px solid var(--accion-borde);cursor:default;"
                    : "background:var(--surface);border:1px dashed var(--border-strong);cursor:pointer;")
              )}
            >
              <span
                aria-hidden="true"
                style={css(
                  "flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:var(--t-mini);" +
                    (p.hecho ? "background:var(--accion);color:var(--sobre-accion);" : "border:1.5px dashed var(--border-strong);color:var(--text-4);")
                )}
              >
                {p.hecho ? "✓" : "+"}
              </span>
              <span style={css("flex:1;min-width:0;font-size:var(--t-body);color:var(--text);" + (p.hecho ? "text-decoration:line-through;text-decoration-color:var(--text-4);" : ""))}>
                {p.que}
              </span>
              <span style={css("flex:none;font-size:var(--t-mini);font-weight:500;padding:3px 9px;border-radius:var(--r-pill);background:var(--oro-luz);color:var(--vino);")}>
                +{p.puntos}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
