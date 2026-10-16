/* El marcado del portal, tal cual.
 *
 * Va como texto y se pinta con `dangerouslySetInnerHTML`, no traducido a JSX,
 * y es a conciencia: traducirlo a mano es meter erratas gratis, y el guion
 * del portal trabaja con `getElementById` sobre estos mismos nodos. Así lo
 * que se publica es exactamente lo que se midió. Como se pinta también en el
 * servidor, el texto sigue en el HTML para quien lo lea sin JavaScript.
 */
export const MARCADO = String.raw`
<div class="pista" id="pista">
<main class="recorrido" id="recorrido" data-etapa="pregunta">

  <div class="antesala" id="antesala" aria-label="Abriendo">
    <video id="antesala-video" muted playsinline preload="auto"></video>
    <div class="antesala-velo"></div>
  </div>

  <img class="sello" id="sello" src="/images/logo-33.png" alt="Escuela de Sabiduría 33">

  <div class="cuenta" id="cuenta" aria-live="polite">
    <span id="cuenta-valor">0</span><span class="porciento">%</span>
  </div>

  <div class="velo" aria-hidden="true"></div>

  <header class="cabecera marco">
    <div class="cabecera-acciones">
      <nav class="menu-nav" aria-label="Secciones">
        <a class="puesto" href="/">Portada</a><a href="/cursos">Cursos</a><a href="/membresia">Escuela</a>
      </nav>
      <a class="entrar" href="https://app.escueladesabiduria33.com">Entrar</a>
    </div>
  </header>

  <aside class="etapas marco" id="etapas" aria-label="El recorrido"></aside>

  <canvas id="lienzo-ventana" class="lienzo-ventana" aria-hidden="true"></canvas>

  <section class="ventana-zona marco" aria-hidden="true">
    <div class="ventana" id="ventana">
      <video id="ventana-video" muted playsinline preload="auto"></video>
      <img id="ventana-imagen" src="/images/iris-consulta.jpg" alt="">
    </div>
  </section>

  <section class="contenido marco" aria-live="polite">
    <h1 id="titulo">NUMEROLOGÍA</h1>
    <dl id="datos"></dl>
    <a class="reserva" href="#consultas">Reservar mi consulta <span aria-hidden="true">&#8594;</span></a>
  </section>

  <div class="baja" id="baja" aria-hidden="true">Baja<span></span></div>

  <div class="cursor" aria-hidden="true">
    <span class="cursor-aro"></span><span class="cursor-punto"></span>
  </div>
</main>
</div>
`;
