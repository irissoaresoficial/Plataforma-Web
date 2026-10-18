"use client";

/**
 * ============================================================================
 * GESTIÓN — EL LLAVERO DE LA ESCUELA
 * ============================================================================
 *
 * Quién ha entrado, qué lleva y a qué cursos puede pasar. Es la pantalla con la
 * que Iris COBRA mientras no haya Stripe: alguien le paga por donde sea —Bizum,
 * transferencia, en mano— y ella entra aquí y le da el curso.
 *
 * POR QUÉ ES UNA LISTA Y NO UN TABLERO DE COLUMNAS. La tentación con las
 * personas es siempre el tablero —«interesado», «alumno», «antiguo»— y aquí
 * sería un error de los que no se ven hasta que estorban: un tablero obliga a
 * que cada persona esté en UNA columna, y lo normal aquí es llevar varias
 * llaves a la vez. Quien compra un curso y paga membresía no está en dos
 * sitios: es una persona con dos llaves.
 *
 * TRES COSAS QUE ESTA PANTALLA HACE CON CUIDADO
 * ---------------------------------------------------------------------------
 *
 * 1. NO DEJA QUE IRIS SE CIERRE LA PUERTA A SÍ MISMA. Quitarse la propia
 *    administración, o desactivarse, deja la plataforma sin nadie capaz de
 *    volver a entrar: habría que ir a mano a la consola de Firebase. Las reglas
 *    del servidor ya lo impiden, pero un botón que al pulsarlo da un error de
 *    permisos es un botón mal puesto. Aquí ni siquiera se puede pulsar, y dice
 *    por qué.
 *
 * 2. CADA CAMBIO SE VE EN EL ACTO Y SE DESHACE SI FALLA. Dar un curso es un
 *    clic que tarda en llegar al servidor. Si la pantalla espera, se pulsa dos
 *    veces; si no espera y falla, Iris cree que ha dado un acceso que no dio y
 *    el alumno escribe enfadado. Así que se pinta ya y, si el servidor dice que
 *    no, se vuelve atrás y se cuenta.
 *
 * 3. DISTINGUE «NO HAY NADIE» DE «NO HE PODIDO MIRAR». Una lista vacía porque
 *    todavía no se ha apuntado nadie es la verdad. Una lista vacía porque la
 *    lectura falló es una mentira con pinta de dato.
 */

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { BOTON_NORMAL, BOTON_PLANO, CAMPO, NOTA, TITULO, botonPrincipal , PANTALLA} from "@/lib/ui";
import { useSesion } from "@/lib/sesion";
import { NOMBRE_ROL, ROLES, rolesDe, type Rol } from "@/lib/roles";
import { cambiaUsuario, listaUsuarios, type FichaUsuario } from "@/lib/despacho/usuarios";
import { cursos as repoCursos, inscripciones as repoInscripciones, type Curso, type Inscripcion } from "@/lib/escuela";
import { bajasPendientes, cierraBaja, type Baja } from "@/lib/escuela/micuenta";
import Confirmar from "@/components/Confirmar";

export default function GestionScreen() {
  const { usuario } = useSesion();
  const uidPropio = usuario ? usuario.uid : "";
  const quieto = useReducedMotion();

  const [gente, setGente] = useState<FichaUsuario[] | null>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [inscritos, setInscritos] = useState<Inscripcion[]>([]);
  const [busca, setBusca] = useState("");
  const [abierta, setAbierta] = useState<string | null>(null);
  const [fallo, setFallo] = useState("");
  /** Qué no se pudo leer. Distinto de «no hay nada». */
  const [roto, setRoto] = useState(false);

  /*
   * LAS BAJAS QUE HAN PEDIDO.
   *
   * Van en Gestión y arriba del todo, no al final: es lo único de esta
   * pantalla con un plazo legal encima —un mes desde que se pide— y lo único
   * que, si no se mira, se incumple sin que nada avise. Todo lo demás de aquí
   * puede esperar a mañana.
   */
  const [bajas, setBajas] = useState<Baja[]>([]);

  const carga = useCallback(async () => {
    setFallo("");
    setRoto(false);
    try {
      const [g, c, b] = await Promise.all([
        listaUsuarios(),
        repoCursos.listar(),
        /* Que no haya ninguna baja es lo normal, y que falle esta lectura no
           puede tirar la pantalla entera de accesos. */
        bajasPendientes().catch(() => [] as Baja[]),
      ]);
      setBajas(b);
      /* Las inscripciones se piden por curso porque es como están indexadas.
         Con cuatro cursos son cuatro consultas; con cuarenta habría que darle
         una vuelta, y ese día se nota y se arregla. */
      const ins = await Promise.all(c.map((x) => repoInscripciones.deCurso(x.id).catch(() => [])));
      setGente(g);
      setCursos(c);
      setInscritos(ins.flat());
    } catch (e) {
      setGente([]);
      setRoto(true);
      setFallo(e instanceof Error ? e.message : "No se ha podido leer la lista.");
    }
  }, []);

  useEffect(() => {
    void carga();
  }, [carga]);

  const tiene = (uid: string, cursoId: string) =>
    inscritos.some((i) => i.uid === uid && i.cursoId === cursoId);

  /* ------------------------------------------------------------- cambios */

  /**
   * «YA LA HE BORRADO.» Lo marca Iris a mano, cuando de verdad lo ha hecho.
   *
   * No borra nada por su cuenta a propósito: borrar la ficha, las
   * inscripciones y los mensajes de alguien son cuatro acciones encadenadas y
   * ninguna se puede deshacer. Que las haga quien ha leído el caso, con los
   * botones que ya hay en esta misma pantalla, y que esto sólo deje la fecha
   * de cuándo quedó hecho.
   */
  async function cierra(uid: string) {
    setFallo("");
    const antes = bajas;
    setBajas((xs) => xs.filter((x) => x.uid !== uid));
    try {
      await cierraBaja(uid);
    } catch (e) {
      setBajas(antes);
      setFallo(e instanceof Error ? e.message : "No se ha podido cerrar la solicitud.");
    }
  }

  async function alternaCurso(uid: string, cursoId: string) {
    const antes = inscritos;
    const dar = !tiene(uid, cursoId);
    setFallo("");
    setInscritos((xs) =>
      dar
        ? [...xs, { id: `${uid}__${cursoId}`, uid, cursoId, desde: new Date().toISOString(), via: "mano" as const }]
        : xs.filter((i) => !(i.uid === uid && i.cursoId === cursoId))
    );
    try {
      if (dar) await repoInscripciones.dar(uid, cursoId, "mano");
      else await repoInscripciones.quitar(uid, cursoId);
    } catch (e) {
      setInscritos(antes);
      setFallo(e instanceof Error ? e.message : "No se ha podido guardar el cambio.");
    }
  }

  async function alternaRol(f: FichaUsuario, rol: Rol) {
    const mios = rolesDe(f);
    const quitando = mios.includes(rol);
    const nuevos = quitando ? mios.filter((r) => r !== rol) : [...mios, rol];
    const antes = gente;
    setFallo("");
    setGente((xs) => (xs ?? []).map((x) => (x.uid === f.uid ? { ...x, roles: nuevos } : x)));
    try {
      await cambiaUsuario(f.uid, { roles: nuevos });
    } catch (e) {
      setGente(antes);
      setFallo(e instanceof Error ? e.message : "No se ha podido guardar el cambio.");
    }
  }

  async function alternaActivo(f: FichaUsuario) {
    const antes = gente;
    setFallo("");
    setGente((xs) => (xs ?? []).map((x) => (x.uid === f.uid ? { ...x, activo: !x.activo } : x)));
    try {
      await cambiaUsuario(f.uid, { activo: !f.activo });
    } catch (e) {
      setGente(antes);
      setFallo(e instanceof Error ? e.message : "No se ha podido guardar el cambio.");
    }
  }

  /* ------------------------------------------------------------- pintura */

  const lista = (gente ?? []).filter((p) =>
    `${p.nombre} ${p.email}`.toLowerCase().includes(busca.trim().toLowerCase())
  );

  const pastilla = (activo: boolean, apagado = false) =>
    "font-size:var(--t-mini);font-weight:590;padding:5px 12px;border-radius:var(--r-pill);" +
    "border:1px solid " + (activo ? "transparent" : "var(--border)") + ";" +
    (apagado ? "cursor:not-allowed;opacity:.45;" : "cursor:pointer;") +
    (activo
      ? "background:var(--gold-soft);color:var(--gold-deep);"
      : "background:transparent;color:var(--text-3);");

  return (
    <div style={css(PANTALLA + "display:flex;flex-direction:column;gap:var(--s4);")}>
      <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
        <h1 style={css(TITULO + "margin:0;")}>Gestión</h1>
        {gente !== null && !roto && (
          <span style={css(NOTA)}>
            {gente.length} {gente.length === 1 ? "persona" : "personas"}
          </span>
        )}
      </div>

      <p style={css(NOTA + "margin:0;max-width:72ch;line-height:1.55;")}>
        Aquí das acceso a mano mientras no haya pagos automáticos. Alguien te paga, lo buscas en la lista y le marcas
        el curso. Para que aparezca aquí, antes tiene que haberse creado una cuenta en la plataforma.
      </p>

      {fallo && (
        <p role="alert" style={css(NOTA + "margin:0;color:var(--alarma, #C0392B);")}>
          {fallo}
        </p>
      )}

      {/* ------------------------------------------------- bajas pedidas */}
      {bajas.length > 0 && (
        <section
          style={css(
            "background:var(--surface);border:1px solid var(--alarma, #C0392B);border-radius:var(--r);" +
              "box-shadow:var(--nm);padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s3);"
          )}
        >
          <div>
            <h2 style={css("font-size:var(--t-head);margin:0 0 6px;")}>
              {bajas.length === 1 ? "Alguien ha pedido que borres su cuenta" : `${bajas.length} personas han pedido que borres su cuenta`}
            </h2>
            <p style={css(NOTA + "margin:0;line-height:1.55;max-width:70ch;")}>
              Por ley tienes un mes desde la fecha de la solicitud. Su avance en los cursos ya se borró solo. Lo que
              queda por hacer es: quitarle los cursos y desactivarla aquí abajo, borrar sus mensajes de la comunidad si
              los tiene, y borrar su cuenta de acceso en la consola de Firebase. Cuando lo hayas hecho, márcalo.
            </p>
          </div>

          {bajas.map((b) => (
            <div
              key={b.uid}
              style={css(
                "display:flex;gap:var(--s3);align-items:center;flex-wrap:wrap;" +
                  "border-top:1px solid var(--border);padding-top:var(--s3);"
              )}
            >
              <div style={css("flex:1 1 220px;min-width:0;")}>
                <div style={css("font-size:var(--t-body);font-weight:600;color:var(--text);")}>{b.nombre || "Sin nombre"}</div>
                <div style={css(NOTA + "overflow-wrap:anywhere;margin-top:3px;")}>{b.email}</div>
              </div>
              <span style={css(NOTA + "flex:none;")}>
                pedida el{" "}
                {new Date(b.pedida).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <Confirmar
                estilo={BOTON_NORMAL + "flex:none;"}
                pregunta={
                  "Esto no borra nada: sólo apunta que ya lo has borrado tú. Si todavía no lo has hecho, déjalo " +
                  "pendiente para que no se te olvide."
                }
                confirmar="Ya está hecho"
                alConfirmar={() => void cierra(b.uid)}
              >
                Ya lo he borrado
              </Confirmar>
            </div>
          ))}
        </section>
      )}

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nombre o correo"
        aria-label="Buscar una persona"
        style={css(CAMPO + "max-width:360px;")}
      />

      {gente === null && <p style={css(NOTA + "margin:0;")}>Cargando…</p>}

      {/* No es lo mismo que no haya nadie que no haber podido mirar. */}
      {roto && (
        <p style={css(NOTA + "margin:0;")}>
          No se ha podido leer la lista. Mira la conexión y vuelve a entrar; si sigue, puede que falten las reglas de
          Firestore.
        </p>
      )}

      {gente !== null && !roto && gente.length === 0 && (
        <div
          style={css(
            "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
              "padding:clamp(28px,5vw,48px) var(--pad-card);box-shadow:var(--nm);max-width:620px;"
          )}
        >
          <h2 style={css("font-size:var(--t-head);margin:0 0 var(--s2);")}>Todavía no hay nadie más que tú</h2>
          <p style={css("font-size:var(--t-read);line-height:1.6;color:var(--text-3);margin:0;text-wrap:pretty;")}>
            Cuando alguien se cree una cuenta en la plataforma, aparece en esta lista y aquí le das lo que haya
            comprado.
          </p>
        </div>
      )}

      <div style={css("display:flex;flex-direction:column;gap:var(--s2);")}>
        {lista.map((p, i) => {
          const mios = rolesDe(p);
          const yoMismo = p.uid === uidPropio;
          const desplegada = abierta === p.uid;
          return (
            <motion.article
              key={p.uid}
              initial={quieto ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(0.04 * i, 0.2), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={css(
                "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
                  "box-shadow:var(--nm);padding:var(--s3) var(--s4);" +
                  (p.activo ? "" : "opacity:.6;")
              )}
            >
              <div style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;")}>
                <span
                  aria-hidden
                  style={css(
                    "flex:none;display:grid;place-items:center;width:38px;height:38px;border-radius:50%;" +
                      "background:var(--gold-soft);color:var(--gold-deep);font-weight:600;font-size:var(--t-body);"
                  )}
                >
                  {(p.nombre.trim()[0] || "·").toUpperCase()}
                </span>

                <div style={css("flex:1 1 180px;min-width:0;")}>
                  <div style={css("font-size:var(--t-body);font-weight:600;color:var(--text);")}>
                    {p.nombre || "Sin nombre"}
                    {yoMismo && <span style={css(NOTA + "margin-left:8px;font-weight:400;")}>— eres tú</span>}
                    {!p.activo && <span style={css(NOTA + "margin-left:8px;")}>· acceso apagado</span>}
                  </div>
                  <div style={css(NOTA + "overflow-wrap:anywhere;")}>{p.email}</div>
                </div>

                <div style={css("display:flex;gap:6px;flex-wrap:wrap;flex:1 1 140px;")}>
                  {mios.length === 0 ? (
                    <span style={css(NOTA + "font-style:normal;")}>sin acceso a nada</span>
                  ) : (
                    mios.map((r) => (
                      <span
                        key={r}
                        style={css(
                          "font-size:var(--t-micro);font-weight:600;padding:3px 9px;border-radius:var(--r-pill);" +
                            (r === "admin"
                              ? "background:var(--gold-soft);color:var(--gold-deep);"
                              : "background:color-mix(in srgb, var(--text) 8%, transparent);color:var(--text-3);")
                        )}
                      >
                        {NOMBRE_ROL[r]}
                      </span>
                    ))
                  )}
                </div>

                <button
                  onClick={() => setAbierta(desplegada ? null : p.uid)}
                  aria-expanded={desplegada}
                  style={css(BOTON_NORMAL + "flex:none;")}
                >
                  {desplegada ? "Cerrar" : "Gestionar"}
                </button>
              </div>

              {desplegada && (
                <motion.div
                  initial={quieto ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  style={css("overflow:hidden;")}
                >
                  <div style={css("padding-top:var(--s4);margin-top:var(--s3);border-top:1px solid var(--border);display:flex;flex-direction:column;gap:var(--s4);")}>
                    {/* ------------------------------------------- llaves */}
                    <div>
                      <div style={css(NOTA + "margin-bottom:9px;")}>Llaves</div>
                      <div style={css("display:flex;gap:7px;flex-wrap:wrap;")}>
                        {ROLES.map((r) => {
                          /* El candado: Iris no puede quitarse la suya. Las
                             reglas del servidor ya lo impiden; esto evita que
                             pueda pulsarse y recibir un error de permisos, que
                             no explica nada a quien lo ve. */
                          const bloqueado = yoMismo && r === "admin";
                          return (
                            <button
                              key={r}
                              onClick={() => !bloqueado && void alternaRol(p, r)}
                              disabled={bloqueado}
                              title={bloqueado ? "No puedes quitarte tu propia administración" : undefined}
                              style={css(pastilla(mios.includes(r), bloqueado))}
                            >
                              {NOMBRE_ROL[r]}
                            </button>
                          );
                        })}
                      </div>
                      {yoMismo && (
                        <p style={css(NOTA + "margin:9px 0 0;max-width:62ch;line-height:1.5;")}>
                          Tu administración no se puede quitar desde aquí. Si pudieras, no quedaría nadie capaz de
                          devolvértela sin entrar a mano en la consola de Firebase.
                        </p>
                      )}
                    </div>

                    {/* ------------------------------------------ cursos */}
                    <div>
                      <div style={css(NOTA + "margin-bottom:9px;")}>Cursos a los que tiene acceso</div>
                      {cursos.length === 0 ? (
                        <p style={css(NOTA + "margin:0;")}>Todavía no has creado ningún curso.</p>
                      ) : (
                        <div style={css("display:flex;gap:7px;flex-wrap:wrap;")}>
                          {cursos.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => void alternaCurso(p.uid, c.id)}
                              style={css(pastilla(tiene(p.uid, c.id)))}
                            >
                              {c.titulo || "Curso sin nombre"}
                              {!c.publicado && <span style={css(NOTA + "margin-left:6px;")}>· borrador</span>}
                            </button>
                          ))}
                        </div>
                      )}
                      <p style={css(NOTA + "margin:9px 0 0;max-width:62ch;line-height:1.5;")}>
                        Marcar un curso aquí no le da la llave de «alumno»: son dos cosas. La llave abre el apartado de
                        cursos; el curso marcado dice cuál ve dentro.
                      </p>
                    </div>

                    {/* ----------------------------------------- el acceso */}
                    <div>
                      <div style={css(NOTA + "margin-bottom:9px;")}>El acceso a la plataforma</div>
                      <button
                        onClick={() => !yoMismo && void alternaActivo(p)}
                        disabled={yoMismo}
                        title={yoMismo ? "No puedes apagarte el acceso a ti misma" : undefined}
                        style={css(BOTON_PLANO + (yoMismo ? "opacity:.45;cursor:not-allowed;" : ""))}
                      >
                        {p.activo ? "Apagar el acceso" : "Volver a encender el acceso"}
                      </button>
                      <p style={css(NOTA + "margin:9px 0 0;max-width:62ch;line-height:1.5;")}>
                        Apagar el acceso deja a esa persona fuera al instante sin borrar nada: su avance, sus mensajes
                        y lo que compró siguen ahí. Si vuelve, se enciende y lo encuentra todo.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.article>
          );
        })}

        {gente !== null && gente.length > 0 && lista.length === 0 && (
          <p style={css(NOTA + "margin:var(--s3) 0;")}>Nadie con ese nombre ni ese correo.</p>
        )}
      </div>
    </div>
  );
}
