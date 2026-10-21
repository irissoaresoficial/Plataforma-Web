"use client";
import AcercaDe from "./AcercaDe";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp, type Base, type Seccion, type Disciplina, type View } from "@/lib/app-context";
import { useSesion } from "@/lib/sesion";
import type { Capacidad } from "@/lib/roles";
import {
  IcoAgenda,
  IcoAlma,
  IcoArbol,
  IcoBase9,
  IcoBase22,
  IcoCiclos,
  IcoClientes,
  IcoComunidad,
  IcoConsulta,
  IcoCursos,
  IcoEscuela,
  IcoGestion,
  IcoMetricas,
  IcoCuentas,
  IcoDocumento,
  IcoEstructura,
  IcoFacturas,
  IcoNumerologia,
  IcoNumeros,
  IcoPareja,
  IcoPlegar,
  IcoResumen,
  IcoTablero,
} from "./Iconos";

type Ico = (p: { size?: number }) => React.JSX.Element;
type Item = { k: Seccion; label: string; Ico: Ico };

/* En la lateral los nombres van cortos: caben en un renglón y la columna
 * queda a plomo. El nombre largo sigue estando en el encabezado de cada
 * sección. */
const KABALA: Item[] = [
  { k: "resumen", label: "Resumen", Ico: IcoResumen },
  { k: "arbol", label: "Árbol", Ico: IcoArbol },
  { k: "numeros", label: "Números", Ico: IcoNumeros },
  { k: "estructura", label: "Estructura", Ico: IcoEstructura },
  { k: "alma", label: "Imagen del alma", Ico: IcoAlma },
  { k: "cuentas", label: "Cuentas abiertas", Ico: IcoCuentas },
  { k: "ciclos", label: "Ciclos vitales", Ico: IcoCiclos },
];

/**
 * Las dos bases de la numerología, que son las «partes» de esa disciplina.
 *
 * Los rótulos van cortos porque la columna es estrecha, pero llevan el número
 * dentro a propósito: «22» y «9» son como se llaman en clase, y es lo que hace
 * que se entienda de un vistazo que son dos sistemas y no dos pestañas.
 */
const BASES: Array<{ k: Base; label: string; Ico: Ico }> = [
  { k: "b22", label: "Base 22", Ico: IcoBase22 },
  { k: "b9", label: "Base 9", Ico: IcoBase9 },
];

/** Las disciplinas de la escuela, en el orden en que se estudian. Feng Shui
 *  estaba aquí en tercer lugar y se ha retirado: no había nada detrás. */
export const DISCIPLINAS: Array<{ k: Disciplina; label: string; Ico: Ico }> = [
  { k: "kabala", label: "Kábala", Ico: IcoArbol },
  { k: "numerologia", label: "Numerología", Ico: IcoNumerologia },
];

/** El despacho: lo que no es leer una carta. Nunca se bloquea — una factura no
 *  depende de que haya un estudio abierto. */
const DESPACHO: Array<{ k: View; label: string; Ico: Ico }> = [
  { k: "agenda", label: "Agenda", Ico: IcoAgenda },
  { k: "personas", label: "Personas", Ico: IcoClientes },
  { k: "facturas", label: "Facturas", Ico: IcoFacturas },
];

/**
 * LA ESCUELA: lo que ve quien paga.
 *
 * Cada entrada dice qué llave pide, y el menú no enseña las que no se tienen.
 * Un alumno no ve «Comunidad» en gris con un candado al lado: no la ve. Una
 * puerta cerrada que se ve es una invitación a empujarla, y además obliga a
 * explicar en el menú por qué no se puede pasar.
 */
/*
 * LOS TROFEOS NO ESTÁN AQUÍ, Y ES A PROPÓSITO.
 *
 * Estaban, y Gerson los sacó: «eso tiene que ser como en el apartado de
 * perfil». Tiene razón, y el motivo va más allá de dónde cae un enlace.
 *
 * Una pestaña llamada «Trofeos» convierte el juego en una tarea: aparece en el
 * menú al mismo nivel que los cursos, como si hubiera que ir a hacerla. Y la
 * primera vez que alguien la abre está vacía, que es el peor arranque posible
 * para lo único que tenía que dar alegría.
 *
 * Donde funciona es pegado a la persona: en su perfil, al lado de su nombre,
 * junto a lo que lleva hecho. Ahí no es una sección que visitar — es algo que
 * uno TIENE, y que crece mientras hace lo demás.
 */
const ESCUELA: Array<{ k: View; label: string; Ico: Ico; llave: Capacidad }> = [
  { k: "escuela", label: "Inicio", Ico: IcoEscuela, llave: "escuela" },
  { k: "cursos", label: "Cursos", Ico: IcoCursos, llave: "cursos" },
  { k: "comunidad", label: "Comunidad", Ico: IcoComunidad, llave: "comunidad" },
];

/** Lo de Iris que no es ni el estudio ni el despacho de siempre. */
const DIRECCION: Array<{ k: View; label: string; Ico: Ico; llave: Capacidad }> = [
  { k: "metricas", label: "Métricas", Ico: IcoMetricas, llave: "metricas" },
  { k: "gestion", label: "Altas y accesos", Ico: IcoGestion, llave: "gestion" },
];

/**
 * TODA LA NAVEGACIÓN, EN UN SOLO SITIO.
 *
 * Antes estaba repartida en dos: una tira de pestañas arriba —Consulta, Panel,
 * Estudio y los tres del despacho— y esta columna, que sólo llevaba las partes
 * del estudio. Seis pestañas arriba no caben en un portátil, así que a partir
 * de 1200 px se iban al cajón y desaparecían; y tener dos navegaciones que hay
 * que mirar por turnos para saber a dónde se puede ir es exactamente lo que
 * hace que una herramienta se sienta grande y confusa.
 *
 * Ahora la columna es LA navegación, con dos grupos:
 *
 *   EL ESTUDIO      — la consulta y las disciplinas con sus partes.
 *   PARA ENTREGAR   — lo que sale de ahí y se le da a la persona.
 *   EL DESPACHO     — la agenda, los clientes y las facturas.
 *
 * SON TRES Y NO DOS desde que se sacaron de «El estudio» el documento y la
 * comparativa de pareja. Estaban colgando debajo de las disciplinas, al mismo
 * nivel que «Kábala» y «Numerología», y ahí mezclan dos cosas distintas: las
 * disciplinas son DÓNDE SE TRABAJA y el documento es QUÉ SE ENTREGA. Puestos
 * en la misma lista, hay que leerlos todos para saber cuál es cuál.
 *
 * Cada grupo contesta ahora a una pregunta: dónde miro, qué le doy, cómo llevo
 * el negocio. Arriba se queda
 * la marca, la cuenta y el tema, que no son navegación.
 *
 * Es la misma lista en los dos sitios donde aparece —esta columna en pantalla
 * ancha y el cajón en móvil— para que no haya dos que mantener y que puedan
 * discrepar. `alCambiar` lo usa el cajón para cerrarse al elegir.
 */
export function NavDisciplinas({ alCambiar, compacta }: { alCambiar?: () => void; compacta?: boolean }) {
  const { r, re, view, setView, seccion, setSeccion, disciplina, setDisciplina, base, setBase } = useApp();
  const { puede } = useSesion();
  const quieto = useReducedMotion();
  /*
   * QUÉ DISCIPLINAS ESTÁN DESPLEGADAS.
   *
   * Aquí ponía `useState(["kabala"])`: Kábala salía abierta SIEMPRE, mirara
   * Iris lo que mirara. Con un estudio cargado eso son siete renglones más
   * —resumen, árbol, números, estructura, imagen del alma, cuentas abiertas y
   * ciclos vitales— colgando debajo, también cuando se está en la escuela, en
   * la agenda o en las facturas, donde no sirven para nada.
   *
   * Gerson: «el tema de la consulta, donde está el cabal, la numerología,
   * quiero que lo resumas un poco, que no se vea tan extenso». Tenía razón, y
   * la forma de resumirlo no es quitar partes —cada una es una parte de la
   * carta y hay que poder llegar a ella— sino enseñarlas CUANDO SE ESTÁ AHÍ.
   *
   * Es exactamente la regla que ya sigue el despacho unas líneas más abajo, y
   * que las dos cosas se comporten igual es la mitad del valor: en este menú
   * un grupo con flecha se abre cuando entras y se puede cerrar a mano, y eso
   * se aprende una vez.
   *
   * Fuera del panel, las dos disciplinas son dos renglones. Dentro, se abre la
   * que se está mirando y la otra se queda recogida.
   */
  const enElPanel = view === "panel";
  /*
   * NO SE GUARDA QUÉ ESTÁ ABIERTO: SE GUARDA QUÉ HA TOCADO IRIS.
   *
   * La primera versión de esto guardaba la lista de abiertas y un efecto se
   * encargaba de meter dentro la disciplina al entrar en el panel. Funcionaba
   * y era más fácil de leer, pero es la forma de hacerlo que React desaconseja
   * —cambiar estado dentro de un efecto por algo que ya se puede deducir— y la
   * propia comprobación del proyecto la marca en rojo.
   *
   * Aquí sólo se guarda lo que NO se puede deducir: si Iris pulsó el nombre
   * para plegar o desplegar ese grupo. Lo demás sale solo de dónde está.
   *
   * Y tiene memoria a propósito: si plegó Kábala, se queda plegada aunque
   * entre y salga. Un menú que vuelve a abrir lo que acabas de cerrar es un
   * menú con el que se pelea.
   */
  const [tocadas, setTocadas] = useState<Partial<Record<Disciplina, boolean>>>({});
  const estaAbierta = (d: Disciplina) => tocadas[d] ?? (enElPanel && disciplina === d);

  const hayEstudio = Boolean(r || re);
  // El estudio de empresa cabe entero en una pantalla: no hay siete partes
  // que listar porque seis de ellas salen de la fecha, y no hay fecha.
  const partesKabala = re ? KABALA.slice(0, 1) : KABALA;

  const alterna = (d: Disciplina) => {
    /* Se mira si estaba abierta ANTES de movernos, no después: al entrar en
       el panel la disciplina se abriría sola, y entonces pulsar su nombre
       desde fuera la abriría y la cerraría en el mismo gesto. */
    const estaba = estaAbierta(d);
    setView("panel");
    setDisciplina(d);
    setTocadas((s) => ({ ...s, [d]: !estaba }));
  };

  const fila = (
    activo: boolean,
    Ico: Ico,
    label: string,
    onClick: () => void,
    opts?: { grande?: boolean; abierta?: boolean; apagado?: boolean; guia?: string }
  ) => {
    const { grande, abierta, apagado, guia } = opts ?? {};
    return (
      <button
        key={label}
        data-guia={guia ? `nav-${guia}` : undefined}
        onClick={apagado ? undefined : onClick}
        disabled={apagado}
        title={compacta ? label : apagado ? "Primero genera un estudio" : undefined}
        aria-label={compacta ? label : undefined}
        aria-current={activo ? "page" : undefined}
        style={css(
          "display:flex;align-items:center;gap:11px;width:100%;text-align:left;padding:10px 12px;white-space:nowrap;border:none;border-radius:var(--r);letter-spacing:-.01em;line-height:1.25;transition:background var(--t-normal),color var(--t-normal);" +
            (apagado ? "cursor:not-allowed;" : "cursor:pointer;") +
            (grande ? "font-size:var(--t-read);font-weight:600;" : "font-size:var(--t-body);font-weight:590;") +
            /*
             * DÓNDE ESTÁS: UNA PASTILLA SÓLIDA, NO UN TINTE.
             *
             * Era un fondo granate al 7 % con la letra en granate. Se veía
             * —apenas— y había que buscarlo. Las dos referencias que mandó
             * Gerson hacen lo mismo y las dos lo hacen igual: la fila donde
             * estás va en SÓLIDO, con la letra invertida.
             *
             * Y es lo correcto, no sólo lo que está de moda. En un menú de doce
             * filas, saber dónde estás tiene que costar cero: con un tinte hay
             * que comparar unas filas con otras; con un bloque sólido, el ojo
             * lo encuentra antes de empezar a leer. Es la única cosa de toda la
             * columna que puede gritar, y por eso no grita nada más.
             */
            "background:" +
            (activo ? "var(--accion)" : "transparent") +
            ";color:" +
            (activo ? "var(--sobre-accion)" : apagado ? "var(--text-4)" : grande ? "var(--text)" : "var(--text-3)") +
            ";"
        )}
      >
        <span
          style={css(
            "flex:none;display:grid;place-items:center;" +
              (grande ? "width:26px;height:26px;border-radius:var(--r-sm);background:var(--gold-soft);" : "") +
              "color:" +
              (apagado
                ? "var(--text-4)"
                : activo
                  ? "var(--sobre-accion)"
                  : grande
                    ? "var(--gold)"
                    : "var(--text-4)") +
              ";"
          )}
        >
          <Ico size={grande ? 16 : 19} />
        </span>
        {!compacta && label}
        {/* La flecha dice si el grupo está abierto y sirve para cerrarlo. */}
        {!compacta && abierta !== undefined && (
          <motion.span
            aria-hidden="true"
            animate={{ rotate: abierta ? 0 : -90 }}
            transition={quieto ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={css("margin-left:auto;display:grid;place-items:center;color:var(--text-4);")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </motion.span>
        )}
      </button>
    );
  };

  /*
   * LA SEPARACIÓN ENTRE GRUPOS ES UNA RAYA, NO UN RÓTULO.
   *
   * Aquí había cuatro rótulos en versalitas —LA ESCUELA, EL ESTUDIO, EL
   * DESPACHO, LA DIRECCIÓN— y Gerson pidió «que en el banner izquierdo no haya
   * tanto texto». Tenía razón, y por un motivo que va más allá de la cantidad:
   *
   * UN RÓTULO SE LEE Y NO SIRVE PARA NADA. Nadie pulsa «EL DESPACHO». Está ahí
   * para decir que lo de abajo va junto, y eso una raya lo dice igual de bien
   * sin pedir que lo leas. Cuatro rótulos son cuatro renglones que el ojo tiene
   * que saltar cada vez que busca dónde ir, y encima en mayúsculas, que se leen
   * más despacio que las minúsculas porque todas las letras miden lo mismo y se
   * pierde la silueta de la palabra.
   *
   * Lo que se pierde es poder nombrar el grupo. Se puede perder: los nombres de
   * dentro ya dicen de qué va cada uno, y quien entra en «Clientes» no necesita
   * que le digan que eso es el despacho.
   */
  const raya = () => (
    <div
      aria-hidden
      style={css(
        "height:1px;margin:var(--s3) 10px;background:var(--border);" +
          /* Plegada a iconos la raya se estrecha con la columna en vez de
             tocar los bordes, que ahí quedaría como un corte. */
          (compacta ? "margin-left:6px;margin-right:6px;" : "")
      )}
    />
  );

  /*
   * EL NOMBRE DE CADA GRUPO, ESCRITO.
   *
   * La columna eran cinco montones separados por una raya y sin nombre. Para
   * saber que «Agenda» era del despacho y «Cursos» de la escuela había que
   * acordarse; Gerson lo dijo mirándola: «arreglar el orden». Un rótulo corto
   * encima de cada montón lo contesta sin pensar.
   *
   * Plegada a iconos no cabe: ahí vuelve la raya, que es lo que había.
   */
  const grupo = (texto: string) =>
    compacta ? (
      raya()
    ) : (
      <div style={css("padding:0 12px 6px;font-size:var(--t-mini);font-weight:500;color:var(--text-4);letter-spacing:.01em;")}>
        {texto}
      </div>
    );

  const ir = (v: View) => () => {
    setView(v);
    alCambiar?.();
  };

  /*
   * QUÉ SE ENSEÑA DE CADA MUNDO.
   *
   * Lo que no se puede abrir no sale. Ni en gris, ni con candado: no sale.
   *
   * Y un grupo entero sin una sola entrada abierta tampoco sale, con su
   * rótulo incluido. Si no, un alumno vería «EL DESPACHO» escrito encima de
   * un hueco vacío, que es peor que no verlo: le dice que ahí hay algo suyo
   * que no le dejan ver.
   */
  /* EL RECIBIDOR, FUERA PARA IRIS. Gerson: «eso de recibidor erradícalo».
     Era la portada de los alumnos repetida dentro de la de Iris, que ya tiene
     su tablero. Para un alumno o un creador sigue siendo su «Inicio»: es la
     única puerta que tienen. */
  const escuela = ESCUELA.filter((x) => puede(x.llave) && !(x.k === "escuela" && puede("despacho")));
  const direccion = DIRECCION.filter((x) => puede(x.llave));
  const verEstudio = puede("estudio");
  const verDespacho = puede("despacho");

  /*
   * EL ORDEN, DESDE EL 20 DE OCTUBRE DE 2026: EL DÍA, EL OFICIO, LA ESCUELA.
   *
   * Arriba iba la escuela, con el argumento de que es lo que ve todo el mundo.
   * Para un alumno sigue siendo lo único que hay, así que para él no cambia
   * nada. Para Iris el orden era el de la herramienta y no el de su mañana:
   * abría y lo primero eran los cursos, después el estudio, y el despacho
   * escondido en un pliegue.
   *
   * Ahora va en el orden en que se trabaja. Primero el tablero —cómo va el
   * día—, después el estudio y el despacho, que es su oficio, y debajo la
   * escuela y la dirección, que se miran pero no se trabajan a diario.
   *
   * EL DESPACHO YA NO SE PLIEGA. Se plegaba para adelgazar la columna, y con
   * los grupos rotulados cabe entera en 900 px de alto. Tres renglones a la
   * vista valen más que un pliegue que hay que abrir para encontrar la agenda.
   */
  return (
    <nav style={css("display:flex;flex-direction:column;gap:var(--s4);")}>
      {/* ------------------------------------------------------- EL TABLERO */}
      {verDespacho && (
        <div style={css("display:flex;flex-direction:column;gap:2px;")}>
          {fila(view === "tablero", IcoTablero, "Inicio", ir("tablero"))}
        </div>
      )}

      {/* ------------------------------------------------------- EL ESTUDIO */}
      {verEstudio && (
        <div style={css("display:flex;flex-direction:column;gap:2px;")}>
          {grupo("Estudio")}
          {/* La consulta es donde se empieza y donde se cambia de persona, así
              que no se bloquea nunca: es la salida de todas las demás. */}
          {fila(view === "inicio", IcoConsulta, "Consulta", ir("inicio"))}

        {DISCIPLINAS.map((d) => {
          const dentro = view === "panel" && disciplina === d.k;
          /*
           * LAS PARTES DE CADA DISCIPLINA.
           *
           * Kábala tiene siete —las siete partes de una carta— y Numerología
           * tiene DOS, que no son dos vistas de lo mismo sino dos sistemas
           * distintos: la base 22 sale de la fecha y describe cómo se comporta
           * alguien; la base 9 sale del nombre completo y describe de qué está
           * hecho. Antes aquí no había flecha porque Numerología no tenía nada
           * que desplegar, y eso dejaba la base 9 sin forma de encontrarse.
           *
           * Cada parte trae su propio salto porque las dos disciplinas guardan
           * su sitio en sitios distintos —`seccion` una y `base` la otra—, así
           * que la lista lleva la acción dentro en vez de decidirse abajo.
           */
          const partes: Array<{ k: string; label: string; Ico: Ico; activo: boolean; ir: () => void }> = !hayEstudio
            ? []
            : d.k === "kabala"
              ? partesKabala.map((x) => ({
                  k: x.k,
                  label: x.label,
                  Ico: x.Ico,
                  activo: dentro && seccion === x.k,
                  ir: () => {
                    setView("panel");
                    setDisciplina("kabala");
                    setSeccion(x.k);
                  },
                }))
              : BASES.map((x) => ({
                  k: x.k,
                  label: x.label,
                  Ico: x.Ico,
                  activo: dentro && base === x.k,
                  ir: () => {
                    setView("panel");
                    setDisciplina("numerologia");
                    setBase(x.k);
                  },
                }));
          const abierta = partes.length > 0 && (compacta || estaAbierta(d.k));
          return (
            <div key={d.k} style={css("display:flex;flex-direction:column;gap:2px;")}>
              {/* La disciplina abierta no se resalta si tiene partes: ya se ve
                  cuál está por la sección marcada de dentro.

                  PERO PLEGADA SÍ. Antes la condición era «no tiene partes», y
                  desde que las disciplinas nacen plegadas eso dejaba un caso
                  nuevo y malo: estar trabajando dentro de Kábala con el grupo
                  recogido y que el menú no marcara nada en absoluto. La regla
                  de verdad es ésta: se resalta cuando estás dentro y no se ve
                  por otro sitio. */}
              {fila(
                dentro && !abierta,
                d.Ico,
                d.label,
                () => {
                  if (partes.length) alterna(d.k);
                  else {
                    setView("panel");
                    setDisciplina(d.k);
                    alCambiar?.();
                  }
                },
                { grande: true, abierta: partes.length ? abierta : undefined, apagado: !hayEstudio }
              )}
              <AnimatePresence initial={false}>
                {abierta && (
                  <motion.div
                    key="partes"
                    initial={quieto ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={quieto ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.22 } }}
                    style={css("overflow:hidden;")}
                  >
                    {partes.map(({ k, label, Ico, activo, ir: saltar }, i) => (
                      <motion.div
                        key={k}
                        initial={quieto ? false : { opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.035, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {fila(activo, Ico, label, () => {
                          // Pulsar una parte lleva al panel en su disciplina,
                          // aunque se estuviera en otra pantalla.
                          saltar();
                          alCambiar?.();
                        })}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/*
          * LO QUE SE ENTREGA VA AQUÍ DENTRO, NO EN UN GRUPO APARTE.
          *
          * Tenía su propio rótulo —«PARA ENTREGAR»— y Gerson lo mandó dentro:
          * «es parte de lo mismo». Y lo es: el documento y la comparativa SALEN
          * del estudio que esté abierto. Sin estudio no hay ninguno de los dos,
          * exactamente igual que las disciplinas de arriba, y se apagan a la
          * vez que ellas.
          *
          * Un grupo aparte decía lo contrario: que era otro sitio al que ir.
          * Y encima partía en dos un menú que ya tenía cinco rótulos, que es
          * más de los que nadie lee.
          *
          * Van separados por un poco de aire y no por un rótulo: se ve que son
          * el final del estudio —lo que sale de él— sin anunciar un viaje.
          */}
        <div style={css("height:var(--s3);")} aria-hidden />
        {fila(view === "estudio", IcoDocumento, "El documento", ir("estudio"), { apagado: !hayEstudio })}
        {fila(view === "pareja", IcoPareja, "Comparar pareja", ir("pareja"), { apagado: !hayEstudio })}
        </div>
      )}

      {/* ------------------------------------------------------ EL DESPACHO */}
      {verDespacho && (
        <div style={css("display:flex;flex-direction:column;gap:2px;")}>
          {grupo("Despacho")}
          {DESPACHO.map(({ k, label, Ico }) => fila(view === k, Ico, label, ir(k)))}
        </div>
      )}

      {/* ------------------------------------------------------- LA ESCUELA */}
      {/* Para Iris el recibidor se llama así: «Inicio» ya es su tablero, y dos
          «Inicio» en la misma columna son una adivinanza. Para un alumno sigue
          siendo su inicio, porque es el único que tiene. */}
      {escuela.length > 0 && (
        <div style={css("display:flex;flex-direction:column;gap:2px;")}>
          {verDespacho && grupo("Escuela")}
          {escuela.map(({ k, label, Ico }) => fila(view === k, Ico, label, ir(k), { guia: k }))}
        </div>
      )}

      {/* ------------------------------------------------------ TU ESPACIO */}
      {/* El del creador de cursos: su agenda y sus números. Iris no lo ve
          aquí porque tiene los suyos, más completos, en Despacho y Dirección. */}
      {puede("crear") && !verDespacho && (
        <div style={css("display:flex;flex-direction:column;gap:2px;")}>
          {grupo("Tu espacio")}
          {fila(view === "miagenda", IcoAgenda, "Mi agenda", ir("miagenda"), { guia: "miagenda" })}
          {fila(view === "mismetricas", IcoMetricas, "Mis métricas", ir("mismetricas"))}
        </div>
      )}

      {/* ------------------------------------------------------ LA DIRECCIÓN */}
      {direccion.length > 0 && (
        <div style={css("display:flex;flex-direction:column;gap:2px;")}>
          {grupo("Dirección")}
          {direccion.map(({ k, label, Ico }) => fila(view === k, Ico, label, ir(k)))}
        </div>
      )}

    </nav>
  );
}

export default function Sidebar() {
  const { lateral, setLateral } = useApp();

  return (
    <aside
      data-sidebar=""
      data-chrome="1"
      style={css(
        "position:sticky;top:63px;align-self:start;flex:none;width:" +
          (lateral ? "238px" : "62px") +
          /* Cristal, igual que la cabecera: es la otra pieza que se queda quieta
             mientras el contenido pasa por detrás. */
          ";height:calc(100vh - 63px);overflow-y:auto;overflow-x:hidden;padding:14px 12px 16px;display:flex;flex-direction:column;background:var(--vidrio);backdrop-filter:var(--vidrio-difuminado);-webkit-backdrop-filter:var(--vidrio-difuminado);border-right:1px solid var(--border);transition:width var(--t-lento) var(--curva);"
      )}
    >
      <button
        onClick={() => setLateral(!lateral)}
        title={lateral ? "Plegar la columna" : "Desplegar la columna"}
        aria-label={lateral ? "Plegar la columna" : "Desplegar la columna"}
        style={css(
          "display:flex;align-items:center;gap:9px;width:100%;margin-bottom:var(--s4);padding:8px;border:none;border-radius:var(--r-sm);background:none;color:var(--text-4);cursor:pointer;font-size:var(--t-mini);font-weight:590;white-space:nowrap;"
        )}
      >
        <span style={css("flex:none;display:grid;place-items:center;")}>
          <IcoPlegar size={19} abierto={lateral} />
        </span>
        {lateral && "Plegar"}
      </button>
      <NavDisciplinas compacta={!lateral} />
      {/* Abajo del todo: los primeros pasos (los pinta `escuela/GuiaPasos.tsx`
          aquí dentro, en `data-guia-ancla`) y «Acerca de esto». */}
      <div style={css("margin-top:auto;padding-top:var(--s4);display:flex;flex-direction:column;gap:6px;")}>
        <div data-guia-ancla="" />
        <AcercaDe compacta={!lateral} />
      </div>
    </aside>
  );
}
