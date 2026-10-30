"use client";
/**
 * ============================================================================
 * LA BRÚJULA DEL MÓVIL
 * ============================================================================
 *
 * Con el móvil en la mano, de espaldas a la casa y mirando a la calle, la parte
 * de arriba del teléfono apunta hacia donde mira la fachada. Eso es justo lo
 * que mide un luopan, así que el luopan de la pantalla gira con la brújula del
 * teléfono y marca la orientación en directo.
 *
 * TRES COSAS QUE HAY QUE SABER, y que la pantalla dice:
 *
 *   · En iPhone hay que PEDIR PERMISO, y sólo se puede pedir desde un toque.
 *     Por eso no se enciende sola: se enciende con un botón.
 *   · Un ordenador no tiene brújula. Ahí se gira a mano o se escriben los
 *     grados que marca un luopan de verdad.
 *   · La brújula de un móvil se equivoca unos grados, y más cerca de metal.
 *     Sirve para orientarse y para comprobar; para el estudio, mejor tres
 *     lecturas y su media, y si hay un luopan físico, manda el luopan.
 *
 * Se mide contra el NORTE MAGNÉTICO, sin corregir la declinación: es lo que
 * hace la mayoría de practicantes (y en España la diferencia es de un grado).
 */
import { useCallback, useEffect, useRef, useState } from "react";

type EventoBrujula = DeviceOrientationEvent & { webkitCompassHeading?: number };
type ConPermiso = { requestPermission?: () => Promise<"granted" | "denied"> };

export type EstadoBrujula = "apagada" | "pidiendo" | "encendida" | "sin-brujula" | "denegada";

export function useBrujulaMovil(alLeer: (grados: number) => void) {
  const [estado, setEstado] = useState<EstadoBrujula>("apagada");
  const ultimo = useRef<{ s: number; c: number } | null>(null);
  const recibido = useRef(false);
  const alLeerRef = useRef(alLeer);
  useEffect(() => {
    alLeerRef.current = alLeer;
  }, [alLeer]);

  const manejador = useCallback((e: Event) => {
    const ev = e as EventoBrujula;
    let rumbo: number | null = null;
    if (typeof ev.webkitCompassHeading === "number") rumbo = ev.webkitCompassHeading;
    else if (ev.absolute && typeof ev.alpha === "number") rumbo = 360 - ev.alpha;
    if (rumbo === null || Number.isNaN(rumbo)) return;
    /* Si el móvil está tumbado, la parte de arriba de la pantalla ya no es la
       de arriba del teléfono. */
    const giro = typeof screen !== "undefined" && screen.orientation ? screen.orientation.angle || 0 : 0;
    rumbo = (rumbo + giro + 360) % 360;
    /* Un poco de calma: la aguja de un móvil tiembla. Se suaviza en senos y
       cosenos para no dar un salto al pasar por el Norte. */
    const r = (rumbo * Math.PI) / 180;
    const prev = ultimo.current;
    const k = 0.25;
    const s = prev ? prev.s + (Math.sin(r) - prev.s) * k : Math.sin(r);
    const c = prev ? prev.c + (Math.cos(r) - prev.c) * k : Math.cos(r);
    ultimo.current = { s, c };
    recibido.current = true;
    alLeerRef.current(((Math.atan2(s, c) * 180) / Math.PI + 360) % 360);
  }, []);

  const apagar = useCallback(() => {
    window.removeEventListener("deviceorientationabsolute", manejador);
    window.removeEventListener("deviceorientation", manejador);
    ultimo.current = null;
    setEstado("apagada");
  }, [manejador]);

  /** Se llama desde el toque del botón: en iPhone, el permiso sólo se puede
   *  pedir dentro de ese gesto. */
  const encender = useCallback(async () => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      setEstado("sin-brujula");
      return;
    }
    const DOE = window.DeviceOrientationEvent as unknown as ConPermiso;
    if (typeof DOE.requestPermission === "function") {
      setEstado("pidiendo");
      try {
        const r = await DOE.requestPermission();
        if (r !== "granted") {
          setEstado("denegada");
          return;
        }
      } catch {
        setEstado("denegada");
        return;
      }
    }
    recibido.current = false;
    const absoluta = "ondeviceorientationabsolute" in window;
    window.addEventListener(absoluta ? "deviceorientationabsolute" : "deviceorientation", manejador);
    setEstado("encendida");
    /* Si en dos segundos no ha llegado ni una lectura, no hay brújula: un
       ordenador, o un navegador que no la deja leer. Se dice, no se espera. */
    window.setTimeout(() => {
      if (!recibido.current) {
        window.removeEventListener("deviceorientationabsolute", manejador);
        window.removeEventListener("deviceorientation", manejador);
        setEstado("sin-brujula");
      }
    }, 2000);
  }, [manejador]);

  useEffect(() => () => {
    window.removeEventListener("deviceorientationabsolute", manejador);
    window.removeEventListener("deviceorientation", manejador);
  }, [manejador]);

  return { estado, encender, apagar };
}
