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

export function CursosScreen() {
  return (
    <EnObra
      fase="Fase 2 · lo siguiente que se construye"
      titulo="Cursos"
      resumen="El corazón de la escuela y lo que se cobra. Iris sube sus cursos ella sola, sin llamar a nadie y sin tocar una línea de código."
      tendra={[
        "Un curso se compone de módulos, y cada módulo de lecciones. Iris los crea, los ordena arrastrando y los publica cuando quiere.",
        "Cada lección lleva su vídeo, su texto y los archivos que se descargan.",
        "El alumno ve sólo los cursos que ha comprado, por dónde iba y qué le queda.",
        "Cada lección terminada se marca sola y suma para los trofeos.",
        "Mientras no esté Stripe, Iris da el acceso a mano desde Gestión.",
      ]}
      espera="Dónde se alojan los vídeos. Bunny Stream cuesta unos céntimos por hora vista y no deja descargar el vídeo — es lo que usan las escuelas que cobran. YouTube en oculto es gratis pero cualquier alumno puede pasar el enlace. Es una decisión de dinero contra protección, y la tiene que tomar Iris."
    />
  );
}

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

export function TrofeosScreen() {
  return (
    <EnObra
      fase="Fase 4"
      titulo="Trofeos"
      resumen="La parte que engancha. Que entrar en la escuela dé gusto y que avanzar se note."
      tendra={[
        "Puntos por terminar una lección, por entrar cada día y por participar en la comunidad.",
        "Rachas: los días seguidos que llevas.",
        "Medallas que se abren con una animación, no con un cartel.",
        "Un tablero de los más activos del mes.",
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
