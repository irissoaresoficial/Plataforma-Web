import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
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
    <html lang="es" className={`${display.variable} ${texto.variable}`} suppressHydrationWarning>
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
