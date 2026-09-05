"use client";

/**
 * LA PUERTA
 *
 * Lo primero que se ve al abrir la plataforma si todavía no ha entrado nadie.
 *
 * POR QUÉ SE PARECE A LA WEB Y NO A UN PANEL DE ADMINISTRACIÓN. Es la misma
 * casa: el granate, el sello, Fraunces en el titular. Quien llega aquí viene
 * de la web de Iris o va a volver a ella, y una pantalla de acceso genérica
 * —caja blanca al centro sobre gris— rompe esa continuidad por nada.
 *
 * LO QUE HACE Y LO QUE NO. Recoge el correo y la contraseña y llama a la
 * sesión. Hoy la sesión es una fachada que sólo apunta en el navegador que
 * alguien ha entrado: no protege nada, y por eso esta pantalla lo dice en voz
 * alta y en rojo mientras dure. Cuando esté Firebase, este componente no
 * cambia — sólo cambia lo que hay detrás de `entra()`.
 */

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { css } from "@/lib/css";
import { useSesion } from "@/lib/sesion";

const CURVA = [0.16, 1, 0.3, 1] as const;

export default function Puerta() {
  const { entra, entrando, error } = useSesion();
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entrando) entra(email, clave);
  };

  return (
    <div className="puerta">
      {/* El campo de números del fondo, muy tenue: es el mismo gesto que la
          portada de la web, y aquí cae bien porque de números va todo esto. */}
      <div className="puerta-velo" aria-hidden />

      <motion.div
        className="puerta-caja"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: CURVA }}
      >
        <div className="puerta-sello">
          <Image src="/logo-33-blanco.png" alt="" width={62} height={62} priority />
          <span className="puerta-marca">Escuela de Sabiduría 33</span>
        </div>

        <h1 className="puerta-titulo">El estudio.</h1>
        <p className="puerta-sub">
          Aquí dentro están las fichas, los cálculos y la agenda. Sólo entra quien tiene permiso.
        </p>

        <form className="puerta-form" onSubmit={enviar} noValidate>
          <div className="puerta-campo">
            <label htmlFor="p-correo">Correo</label>
            <input
              id="p-correo"
              type="email"
              autoComplete="username"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
            />
          </div>

          <div className="puerta-campo">
            <label htmlFor="p-clave">Contraseña</label>
            <input
              id="p-clave"
              type="password"
              autoComplete="current-password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="puerta-boton" disabled={entrando}>
            <span>{entrando ? "Entrando…" : "Entrar"}</span>
            <span aria-hidden>→</span>
          </button>

          {/* Vacío no ocupa sitio; con texto se anuncia solo. */}
          <p role="alert" className="puerta-error">
            {error}
          </p>
        </form>

        {/* Mientras la puerta sea de mentira, hay que decirlo donde se vea. Es
            la misma regla que en la web: lo que no está terminado sale marcado
            en rojo, no disimulado. */}
        <div className="puerta-aviso">
          <span>Puerta de prueba</span>
          <p>
            Todavía no protege nada: la comprobación ocurre en este navegador, no en un servidor. Sirve
            para montar las pantallas. <strong>No metas datos de clientes hasta que esté conectada.</strong>
          </p>
        </div>
      </motion.div>

      <a className="puerta-volver" href="https://irissoares.com">
        ← Volver a la web
      </a>
    </div>
  );
}
