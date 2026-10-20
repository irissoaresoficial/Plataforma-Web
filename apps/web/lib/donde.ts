/**
 * DE QUÉ PAÍS Y CIUDAD ENTRA ALGUIEN, SIN GUARDAR LA DIRECCIÓN DE NADIE.
 *
 * Vercel resuelve la ubicación por su cuenta antes de que la petición llegue a
 * la aplicación y la escribe en unas cabeceras. O sea que el país y la ciudad
 * salen gratis, sin llamar a ningún servicio de terceros y sin mandarle a nadie
 * la IP de quien visita — que es la forma habitual de hacer esto y la que
 * habría que declarar en la política de privacidad como cesión a un tercero.
 *
 * El país viene en dos letras («ES») y se deja así: es el estándar ISO y es lo
 * que entiende cualquier herramienta. La ciudad viene codificada para poder
 * viajar en una cabecera, así que hay que descodificarla o Valencia se guarda
 * como «Valencia» pero Córdoba se guarda como «C%C3%B3rdoba».
 *
 * Y AQUÍ ESTÁ LA LÍNEA QUE NO SE CRUZA: país y ciudad, nunca la IP entera. Una
 * IP completa identifica a una persona: es dato personal del artículo 4.1 del
 * RGPD, y guardarla «por si acaso» es justo lo que la Agencia Española de
 * Protección de Datos sanciona. «España · Valencia» contesta lo que hace falta
 * para decidir dónde se anuncia y a qué hora se publica; la IP no añadiría ni
 * un dato útil para eso.
 *
 * VIVE AQUÍ Y NO DENTRO DE UNA RUTA PORQUE ESTABA EN UNA SOLA. El formulario
 * de la web lo hacía bien desde el primer día; las reservas, no: guardaban la
 * IP entera, y nadie se dio cuenta porque la función correcta estaba escondida
 * dentro de otro archivo y no se podía usar desde fuera. Una regla que sólo
 * aplica la mitad de la casa no es una regla.
 */
export type Donde = { pais: string; ciudad: string };

export function dondeEsta(request: Request): Donde {
  const h = request.headers;
  const pais = (h.get('x-vercel-ip-country') || '').slice(0, 2).toUpperCase();
  const bruta = h.get('x-vercel-ip-city') || '';
  let ciudad = '';
  try {
    ciudad = decodeURIComponent(bruta).slice(0, 60);
  } catch {
    /* Una cabecera mal codificada no puede tumbar un formulario. Se guarda cruda. */
    ciudad = bruta.slice(0, 60);
  }
  return { pais, ciudad };
}
