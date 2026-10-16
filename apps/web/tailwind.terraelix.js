/* Tailwind SÓLO para la maqueta de /terraelix.html.
   La web de Iris no usa Tailwind: va con CSS escrito a mano en app/globals.css.
   Por eso esto es un config aparte que mira UN archivo y escribe UNA hoja, y
   no toca nada del resto del sitio.

   Y se compila, no se carga del CDN. El `cdn.tailwindcss.com` del guion son
   300 KB de JavaScript que recompilan las clases en el navegador de cada
   visita: vale para probar, no para una página que cobra. Compilado salen
   unos pocos KB de CSS puro. */
module.exports = {
  content: ['./public/terraelix.html'],
  theme: {
    extend: {
      fontFamily: {
        dm: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
