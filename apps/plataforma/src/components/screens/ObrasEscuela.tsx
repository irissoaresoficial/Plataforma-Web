"use client";

/**
 * ============================================================================
 * LAS PANTALLAS QUE TODAVÍA NO ESTÁN
 * ============================================================================
 *
 * Cada una de éstas se va borrando de aquí según se construye de verdad. El
 * texto no es relleno: es el encargo escrito, y es lo que se usará para saber
 * si lo construido es lo que se pidió.
 *
 * Están todas en un archivo a propósito. Repartidas en seis archivos pequeños
 * darían la impresión de que hay seis pantallas hechas, y lo que hay es un
 * cartel repetido seis veces con distinto texto.
 */

import EnObra from "../escuela/EnObra";

export function ComunidadScreen() {
  return (
    <EnObra
      fase="Fase 3"
      titulo="Comunidad"
      resumen="Lo que hace que la gente vuelva cuando ya ha visto los vídeos. Un curso se termina; una comunidad no."
      tendra={[
        "Temas y respuestas, con reacciones.",
        "Iris puede fijar un mensaje arriba, escribir como la escuela y borrar lo que no toque.",
        "Avisos cuando alguien responde, para no tener que estar mirando.",
        "Entra quien tiene la llave de miembro.",
      ]}
    />
  );
}

export function RecursosScreen() {
  return (
    <EnObra
      fase="Fase 4"
      titulo="Recursos"
      resumen="La biblioteca de la escuela. Lo que no es una clase pero hace falta tener a mano."
      tendra={[
        "PDFs, plantillas, audios y guías, por carpetas.",
        "Los sube Iris desde la propia plataforma; se guardan en Firebase Storage.",
        "Los descarga cualquiera que tenga cuenta, sea alumno o miembro.",
        "Buscador, porque una biblioteca sin buscador deja de usarse a las treinta fichas.",
      ]}
    />
  );
}

export function PerfilScreen() {
  return (
    <EnObra
      fase="Fase 4"
      titulo="Tu perfil"
      resumen="Quién eres aquí dentro y lo que llevas hecho. Aquí viven los trofeos: no como una sección que visitar, sino como algo que tienes, pegado a tu nombre, y que crece mientras haces lo demás."
      tendra={[
        "Tu nombre, tu foto y a qué tienes acceso.",
        "Lo que llevas hecho: cursos empezados, lecciones terminadas, por dónde ibas.",
        "Tu racha, los días seguidos que entras.",
        "Las medallas, que se abren con una animación en el momento en que se ganan y luego se quedan aquí.",
        "Cambiar tu contraseña y tus datos, y pedir que se borre tu cuenta — lo exige la ley europea.",
      ]}
      espera="Hasta dónde llega el tablero público. Enseñar quién va primero anima a unos y espanta a otros, y en una escuela de desarrollo personal lo segundo pesa más de lo normal. Se puede enseñar sólo tu propio avance, o el tablero entero, o dejar que cada uno elija si sale."
    />
  );
}

export function MetricasScreen() {
  return (
    <EnObra
      fase="Fase 5 · sólo Iris"
      titulo="Métricas"
      resumen="Cuánta gente entra, desde dónde y qué hace. Para decidir con datos en vez de con la sensación de la semana."
      tendra={[
        "Cuánta gente entra cada día, y desde qué país y ciudad.",
        "Por qué puerta llegaron: Instagram, el buscador, un enlace que mandaste.",
        "Qué curso se termina y cuál se abandona — y en qué lección exacta se cae.",
        "Cuántos de los que entran acaban comprando.",
      ]}
      espera="Nada que decidir, pero sí una regla que se cumple sin discusión: la ubicación se guarda por país y ciudad, nunca la dirección de internet completa, y eso tiene que estar escrito en la política de privacidad antes de encenderlo. Lo exige el reglamento europeo."
    />
  );
}

export function GestionScreen() {
  return (
    <EnObra
      fase="Fase 2 · sólo Iris"
      titulo="Gestión"
      resumen="El llavero. Quién ha entrado, qué ha comprado y a qué tiene acceso."
      tendra={[
        "La lista de todo el mundo con sus llaves: alumno, miembro o las dos.",
        "Dar acceso a un curso a mano — lo que se usa hasta que esté Stripe.",
        "Quitar el acceso sin borrar a nadie, para no perder lo que esa persona hizo.",
        "Invitar por correo.",
      ]}
    />
  );
}
