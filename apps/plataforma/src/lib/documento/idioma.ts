"use client";
import { useCallback, useEffect, useState } from "react";
import { cargaIdioma, guardaIdioma } from "../storage";
import type { Idioma } from "./tipos";

const VALIDOS: Idioma[] = ["es", "pt", "en"];

/**
 * En qué idioma va a salir el documento.
 *
 * Vive aquí y no en el contexto de la aplicación a propósito: sólo lo usa la
 * pantalla del estudio, que es donde se exporta. Montar un proveedor para un
 * solo consumidor añade una capa que hay que atravesar para leer una letra.
 *
 * Empieza en español y lo recuperado del disco llega en un efecto, no en el
 * valor inicial: las páginas se generan estáticas y el servidor no puede ver el
 * disco de este equipo, así que sembrar el idioma guardado en la primera
 * pintada rompería la hidratación. Es el mismo motivo por el que el historial
 * se carga en un efecto (ver `app-context`).
 */
export function useIdiomaDocumento(): [Idioma, (i: Idioma) => void] {
  const [idioma, setIdioma] = useState<Idioma>("es");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const guardado = cargaIdioma();
    if (guardado && (VALIDOS as string[]).includes(guardado)) setIdioma(guardado as Idioma);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const cambia = useCallback((i: Idioma) => {
    setIdioma(i);
    guardaIdioma(i);
  }, []);

  return [idioma, cambia];
}
