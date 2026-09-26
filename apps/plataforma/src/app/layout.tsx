import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, Cormorant_Garamond, Cinzel, Karla } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/app-context";
import { SesionProvider } from "@/lib/sesion";
import Guardia from "@/components/Guardia";

/*
 * LAS MISMAS DOS LETRAS QUE LA WEB
 *
 * Aquí se usaba la tipografía del sistema: San Francisco en un Mac, Karla como
 * red de seguridad fuera. Se ahorraba una descarga, y a cambio la plataforma se
 * veía distinta en cada ordenador y, sobre todo, distinta de la web de Iris.
 * Quien sale de una y entra en la otra tiene que notar que es la misma casa.
 *
 * FRAUNCES en los titulares y en las cifras, con el mismo eje de redondez que
 * allí — si aquí fuera otro, las dos mitades del proyecto tendrían dos letras
 * que casi son la misma, que es peor que tener dos distintas. INSTRUMENT SANS
 * para todo lo que se lee. Las dos por `next/font`: se descargan al compilar y
 * se sirven desde el propio dominio, sin pedirle nada a Google en cada visita.
 */
const display = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--f-display",
  display: "swap",
});

const texto = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--f-texto",
  display: "swap",
});

/*
 * ============================================================================
 * LAS TRES LETRAS DEL DOCUMENTO. FALTABAN, Y ESO ERA EL FALLO MÁS CARO DE TODOS.
 * ============================================================================
 *
 * El estudio que se le entrega a la clienta pedía tres tipografías —Cormorant
 * Garamond para todo el cuerpo, Cinzel para las cifras y Karla para los
 * rótulos— y NINGUNA DE LAS TRES ESTABA IMPORTADA EN NINGÚN SITIO. Se pedían
 * por su nombre en veinte sitios distintos y no existían.
 *
 * Cuando un navegador no encuentra una familia, no avisa: se va callado a la
 * siguiente de la lista. Y la siguiente era el genérico `serif` o `sans-serif`,
 * o sea Times New Roman y Arial. El documento entero de Iris —treinta y dos
 * páginas, veinticinco mil palabras, un trabajo que cobra a cientos de euros—
 * se estaba imprimiendo con la tipografía por defecto del navegador.
 *
 * MEDIDO, no supuesto: componiendo el mismo texto con «Cormorant Garamond» y
 * con `serif` a secas, las dos líneas medían exactamente 505,43 px. Idénticas
 * al decimal. Lo mismo Cinzel, y Karla contra `sans-serif`: 564,82 px las dos.
 * Si la fuente estuviera, no coincidirían jamás.
 *
 * Por qué pasó, que es lo que evita que vuelva a pasar: la plataforma nació con
 * la tipografía del sistema y estas tres como idea de diseño. Después la
 * interfaz se migró a Fraunces e Instrument Sans y se importaron esas dos — y
 * el documento, que vive en su propio módulo, se quedó atrás pidiendo las de
 * antes. Un nombre de fuente escrito a mano no da error de compilación ni se ve
 * roto en pantalla: sólo se ve peor, y eso no se nota si no se compara.
 *
 * SE MANTIENEN LAS TRES EN VEZ DE PASARLO TODO A FRAUNCES. El documento no es
 * la interfaz: es la pieza impresa, y lo que estaba diseñado —una serif de
 * libro para leer veinticinco mil palabras, una romana en versalitas para las
 * cifras y una sans seca para los rótulos— es una combinación correcta para
 * eso. Arreglarlo es hacer que funcione lo que ya estaba pensado, no rediseñar
 * por encima de una decisión que nadie ha revisado.
 *
 * Y VAN COMO VARIABLE, no como nombre suelto. `var(--f-lectura)` falla a la
 * vista el día que se toque; `'Cormorant Garamond'` mal escrito se cae al
 * sistema en silencio, que es justo como llegamos aquí.
 */
const lectura = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--f-lectura",
  display: "swap",
});

const cifra = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--f-cifra",
  display: "swap",
});

const rotulo = Karla({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--f-rotulo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Escuela de Sabiduría 33 · Estudio",
  description: "Plataforma de estudio kabalístico: nombre, fecha y el motor calcula el árbol de la vida, la estructura energética, la imagen del alma y el estudio completo.",
};

/**
 * El tema se decide antes del primer pintado. Si esperásemos a que React
 * monte, la página aparecería en claro y saltaría a oscuro delante de quien
 * mira. Por eso va en un script suelto, síncrono, en el <head>.
 */
const ELIGE_TEMA = `
try {
  var t = localStorage.getItem("es33.tema");
  if (!t) t = matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro";
  document.documentElement.dataset.tema = t;
} catch (e) {
  document.documentElement.dataset.tema = "claro";
}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${texto.variable} ${lectura.variable} ${cifra.variable} ${rotulo.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: ELIGE_TEMA }} />
      </head>
      {/* El estado vive en el layout y no en la página: al cambiar de ruta,
       * App Router conserva el árbol del layout, así que el estudio calculado
       * sigue ahí en vez de recalcularse o perderse. */}
      {/* La sesión envuelve a todo: la guardia decide si se ve la puerta o la
       * plataforma, y el estado del estudio vive dentro, ya con alguien
       * identificado. */}
      <body>
        <SesionProvider>
          <Guardia>
            <AppProvider>{children}</AppProvider>
          </Guardia>
        </SesionProvider>
      </body>
    </html>
  );
}
