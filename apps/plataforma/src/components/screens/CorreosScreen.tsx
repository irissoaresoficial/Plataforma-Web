"use client";

/**
 * LOS CORREOS AUTOMÁTICOS, EN UNA PANTALLA (10 de noviembre de 2026).
 *
 * Gerson: «que se vea la automatización de emails en la misma plataforma.
 * Solamente que lo vea el administrador».
 *
 * Dos circuitos, y aquí se ven los dos con sus días y lo que ya ha salido:
 *
 *   1. LAS INSCRITAS A LA MASTERCLASS. Salen solos: la confirmación al
 *      apuntarse y tres recordatorios. Lo manda la web cada mañana
 *      (apps/web/app/api/recordatorios) y se apunta en cada ficha de `leads`.
 *
 *   2. LA LISTA DE MARCO. Sus clientas, con su firma, desde el correo de la
 *      escuela. Se sube aquí, se lee el correo aquí, y NO SALE NADA hasta que
 *      se enciende aquí. Los textos viven en la web (apps/web/lib/difusion.ts)
 *      y esta pantalla los enseña pidiéndoselos, para que lo que se revisa sea
 *      exactamente lo que sale.
 *
 * Sólo la abre quien tiene la llave `gestion` (app-context), y las reglas de
 * Firestore cierran `difusion` y `difusion-config` a la administración.
 */

import { useCallback, useEffect, useState } from "react";
import { collection, deleteField, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where, writeBatch } from "firebase/firestore";
import { nube } from "@/lib/firebase";
import VistaCorreos, { fecha, hoyMadrid, type Conf, type Contacto, type Envio, type Inscrita, type Textos } from "@/components/correos/VistaCorreos";

/* CON «www», Y NO ES UN DETALLE: la dirección sin «www» redirige, y una
   redirección no lleva el permiso para que otra web la lea. Sin esto la lista
   de correos llegaba vacía y la pantalla no enseñaba ninguno. */
const WEB = (process.env.NEXT_PUBLIC_WEB_URL || "https://escueladesabiduria33.com").replace("://escueladesabiduria33.com", "://www.escueladesabiduria33.com");
const LISTA = "marco";
const TOPE_POR_DEFECTO = 95;
const CACHE = "correos-envios-v1";

/** Saca los correos de un CSV, de una lista pegada o de lo que sea: cualquier
 *  cosa con forma de correo, en minúsculas y sin repetir. */
function correosDe(texto: string): string[] {
  const vistos = new Set<string>();
  for (const m of texto.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) vistos.add(m[0].toLowerCase());
  return [...vistos];
}

/*
 * Desde el 15 de noviembre esta pantalla es un MAPA (components/correos):
 * cajas unidas por flechas. Aquí se queda lo que habla con la base —leer,
 * subir la lista, encender, guardar un texto— exactamente como estaba; el
 * dibujo y las cuentas viven en VistaCorreos.
 */
export default function CorreosScreen() {
  const [envios, setEnvios] = useState<Envio[] | null>(null);
  const [contactos, setContactos] = useState<Contacto[] | null>(null);
  const [inscritas, setInscritas] = useState<Inscrita[] | null>(null);
  const [conf, setConf] = useState<Conf>({ activa: false, tope: TOPE_POR_DEFECTO });
  const [aviso, setAviso] = useState("");
  const [fallo, setFallo] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [version, setVersion] = useState(0);

  const carga = useCallback(async () => {
    const base = nube();
    if (!base) return setFallo("No hay conexión con la base de datos.");
    try {
      const [c, l, k] = await Promise.all([
        getDocs(query(collection(base, "difusion"), where("lista", "==", LISTA))),
        getDocs(query(collection(base, "leads"), where("origen", "==", "curso"))),
        getDoc(doc(base, "difusion-config", LISTA)),
      ]);
      setContactos(c.docs.map((d) => ({ email: d.get("email") ?? "", baja: !!d.get("baja"), enviados: d.get("enviados") ?? {} })));
      setInscritas(l.docs.map((d) => ({ email: d.get("email") ?? "", baja: !!d.get("baja"), recordatorios: d.get("recordatorios") ?? {} })));
      const x = k.data();
      setConf({ activa: !!x?.activa, tope: TOPE_POR_DEFECTO });
    } catch (e) {
      setFallo("No se han podido leer los correos: " + String(e).slice(0, 140));
    }
  }, []);

  /* RÁPIDO: los textos de los tres correos se guardan en este navegador y se
     pintan al momento; por detrás se piden a la web y se cambian si hay algo
     nuevo. Son los textos de la plantilla, no hay ningún dato de nadie. */
  const cargaEnvios = useCallback(() => {
    try {
      const guardado = localStorage.getItem(CACHE);
      if (guardado) setEnvios((e) => e ?? (JSON.parse(guardado) as Envio[]));
    } catch {}
    fetch(`${WEB}/api/difusion/vista`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        setEnvios(j.envios ?? []);
        try {
          localStorage.setItem(CACHE, JSON.stringify(j.envios ?? []));
        } catch {}
      })
      .catch(() => setFallo("No se ha podido leer la lista de correos de la web."));
  }, []);

  /* Fuera del pintado: `carga` puede avisar de un fallo al momento, y eso no
     puede ocurrir dentro del propio efecto. */
  useEffect(() => {
    const t = setTimeout(() => {
      void carga();
      cargaEnvios();
    }, 0);
    return () => clearTimeout(t);
  }, [carga, cargaEnvios]);

  async function guardaTextos(id: string, t: Textos | null): Promise<boolean> {
    const base = nube();
    if (!base) return false;
    setOcupado(true);
    setFallo("");
    try {
      await setDoc(
        doc(base, "difusion-config", LISTA),
        { textos: { [id]: t ? { ...t } : deleteField() }, cambiado: serverTimestamp() },
        { merge: true },
      );
      setAviso(t ? "Guardado. Es lo que saldrá a partir de ahora." : "Vuelto al texto original.");
      cargaEnvios();
      setVersion((v) => v + 1);
      return true;
    } catch (e) {
      setFallo("No se ha podido guardar el correo: " + String(e).slice(0, 140));
      return false;
    } finally {
      setOcupado(false);
    }
  }

  const hoy = hoyMadrid();

  async function sube(archivo: File) {
    const base = nube();
    if (!base) return;
    setOcupado(true);
    setAviso("");
    setFallo("");
    try {
      const correos = correosDe(await archivo.text());
      if (!correos.length) throw new Error("el archivo no tiene ningún correo");
      for (let i = 0; i < correos.length; i += 400) {
        const lote = writeBatch(base);
        for (const email of correos.slice(i, i + 400)) {
          /* `merge`: subir la lista otra vez no borra lo ya enviado ni las bajas. */
          lote.set(doc(base, "difusion", email.replace(/\//g, "_")), { email, lista: LISTA, subido: serverTimestamp() }, { merge: true });
        }
        await lote.commit();
      }
      setAviso(`Subidos ${correos.length} correos. Los que ya estaban conservan lo enviado y sus bajas.`);
      await carga();
    } catch (e) {
      setFallo("No se ha podido subir la lista: " + String(e).slice(0, 140));
    } finally {
      setOcupado(false);
    }
  }

  async function guarda(cambio: Partial<{ activa: boolean; tope: number }>) {
    const base = nube();
    if (!base) return;
    if (cambio.activa) {
      const e = (envios ?? []).filter((x) => x.dia <= hoy).pop() ?? envios?.[0];
      const ok = window.confirm(
        `Vas a encender los correos de Marco.\n\nCada mañana a las 8:00 saldrán hasta ${conf.tope} correos` +
          (e ? `, empezando por «${e.asunto}» el ${fecha(e.dia > hoy ? e.dia : hoy)}` : "") +
          ".\n\n¿Has leído el correo y está bien?",
      );
      if (!ok) return;
    }
    setOcupado(true);
    try {
      const nuevo = { ...conf, ...cambio };
      await setDoc(doc(base, "difusion-config", LISTA), { ...nuevo, cambiado: serverTimestamp() }, { merge: true });
      setConf(nuevo);
    } catch (e) {
      setFallo("No se ha podido guardar: " + String(e).slice(0, 140));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <VistaCorreos
      web={WEB}
      envios={envios}
      contactos={contactos}
      inscritas={inscritas}
      conf={conf}
      ocupado={ocupado}
      aviso={aviso}
      fallo={fallo}
      version={version}
      hoy={hoy}
      onSube={(f) => void sube(f)}
      onGuarda={(c) => void guarda(c)}
      onGuardaTextos={guardaTextos}
    />
  );
}
