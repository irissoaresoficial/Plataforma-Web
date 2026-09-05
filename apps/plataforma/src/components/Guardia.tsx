"use client";

/**
 * LA GUARDIA
 *
 * Decide qué se enseña: la puerta o la plataforma. Es un único sitio, y por eso
 * ninguna pantalla tiene que acordarse de comprobar si hay alguien dentro —
 * olvidarse en una sola es como no tener puerta.
 *
 * Los tres estados importan:
 *   · `null`  todavía se está mirando. Se enseña el fondo y nada más. Sin esto,
 *             quien ya había entrado vería un parpadeo de la pantalla de acceso
 *             en cada recarga, que es de las cosas que más baratas parecen.
 *   · `false` no hay nadie: la puerta.
 *   · usuario: la plataforma.
 */

import type { ReactNode } from "react";
import { useSesion } from "@/lib/sesion";
import Puerta from "./Puerta";

export default function Guardia({ children }: { children: ReactNode }) {
  const { usuario } = useSesion();

  if (usuario === null) return <div className="puerta-espera" />;
  if (usuario === false) return <Puerta />;
  return <>{children}</>;
}
