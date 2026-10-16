/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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
