import type { Metadata } from "next";
import { Karla } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/app-context";

// Karla es sólo la red de seguridad: en un Mac o un iPad la interfaz va en San
// Francisco y los titulares en New York, que ya trae el sistema. Cinzel y
// Cormorant se retiraron al pasar a tipografía de sistema y descargarlas era
// pagar dos fuentes que ya no se usaban.
const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Escuela de Sabiduría 33 · Estudio de Kábala",
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
    <html lang="es" className={karla.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ELIGE_TEMA }} />
      </head>
      {/* El estado vive en el layout y no en la página: al cambiar de ruta,
       * App Router conserva el árbol del layout, así que el estudio calculado
       * sigue ahí en vez de recalcularse o perderse. */}
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
