/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /*
   * LA PRESENTACIÓN, EN SU SUBDOMINIO.
   *
   * presentacion.escueladesabiduria33.com enseña la página /presentacion sin
   * cambiar la dirección. Es el mismo proyecto de Vercel: basta con añadir el
   * dominio en Vercel (Settings → Domains) y esta regla hace el resto. Las
   * imágenes y lo demás siguen sirviéndose igual desde cualquier dominio.
   */
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          has: [{ type: 'host', value: 'presentacion.escueladesabiduria33.com' }],
          destination: '/presentacion',
        },
      ],
    };
  },

  async redirects() {
    return [
      /* El portal vivía suelto en /portal.html mientras se decidía si entraba.
         Ya es la portada, así que el archivo se ha borrado —dos copias del
         mismo código acaban separándose y nadie sabe cuál manda— y la
         dirección vieja lleva aquí. Permanente: es un cambio para siempre y
         así los buscadores no se quedan con las dos. */
      { source: '/portal.html', destination: '/', permanent: true },
    ];
  },
};

module.exports = nextConfig;
