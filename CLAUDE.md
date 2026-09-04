# Iris Soares · Escuela de Sabiduría 33

Next.js 15 (App Router) + TypeScript + Framer Motion. Se despliega solo en Vercel
con cada push a `main`.

## Cómo está montado

La web es el núcleo. Cuatro páginas, enlazadas entre sí desde el pie:

| Ruta | Para qué es |
|---|---|
| `/` | Marca personal. Se cuenta desde el problema, no desde ella. |
| `/sinergia` | Estudio gratis. Aquí cae el tráfico de redes; captura nombre y correo. |
| `/cursos` | Eventos, con hueco para vídeo y reserva. Plantilla editable. |
| `/membresia` | Lista de espera (aún no ha abierto). 33 € reservando vs 67 € normal. |

`content/site.ts` es el único archivo que hay que tocar para cambiar datos:
fotos, precios, cursos, contacto. Lo que valga `PENDIENTE` sale marcado en la web.

El backend es un Google Apps Script (`google-apps-script/reservas.gs`) que guarda
en la hoja "Datos", crea el evento de calendario y manda los correos. La web habla
con él a través de `/api/booking`, `/api/lead` y `/api/availability`, que guardan
la URL y la contraseña en el servidor. `/api/diagnostico` dice en castellano qué
falta por configurar.

## Reglas de diseño (las pidió el cliente, valen para todo)

**Lo moderno e innovador es el punto de partida, no un extra.** Nada de plantilla
corporativa ni de patrones vistos mil veces.

**Tipografía.** Limpia, femenina, legible, tierna y elegante. Aquí:
- Titulares: **Fraunces** (`--serif`), variable. Se usa siempre con sus ejes:
  `.display` lleva `'opsz' 144, 'SOFT' 100` — el eje SOFT redondea los remates y
  es lo que la hace cálida en vez de severa. `.display-sm` para tamaño de lectura.
- Cuerpo y botones: **Plus Jakarta Sans** (`--sans`), geométrica de curvas suaves.
- Las mayúsculas **nunca** llevan tracking negativo: apretadas se leen como un
  bloque, no como una frase.

**Composición.** Antes de dar algo por bueno, mirar la captura: un hueco grande
de fondo vacío es un fallo, no un respiro. Las fotos que ocupan pantalla salen a
sangre por el borde, no como tarjeta centrada con aire muerto alrededor.

**Menos datos, mejores datos.** Una cifra que signifique algo vale más que tres
que rellenan. "3 idiomas" no le resuelve nada a quien acaba de llegar.

**Fotos.** Cuantas más de ella, mejor. Van en `public/images/` con los nombres de
`FOTOS`; si falta una sale un hueco que dice qué archivo espera, nunca un roto.

**El logo de la escuela sale en todo.** Dos versiones sin fondo: `logo-33.png` a
color para papel blanco (el informe), `logo-33-blanco.png` para el negro de la
web. Ambas pasan por `components/Marca.tsx`. Es un mandala muy detallado: por
debajo de unos 50 px no se lee, así que grande en los pies y como sello en los navs.

## Reglas de honestidad

Esto no es opcional en este proyecto:

- **Nada dice "guardado" si no se guardó.** Si el Apps Script no está configurado
  o falla, la web lo dice; no enseña un "¡gracias!" falso.
- **Ningún dato inventado.** Nada de plazas ocupadas, testimonios o cifras de
  relleno. Si el dato no existe, se marca `PENDIENTE`.
- **Nada de frases vacías** del tipo "no adivino nada". Y nunca poner mal a la
  familia de nadie para vender: son patrones, no culpables.

## Cómo se comprueba

`npm run build` y después mirarlo en el navegador de verdad. Google Fonts está
bloqueado en el sandbox: para ver la tipografía real hay que interceptar
`fonts.googleapis.com` en Playwright y servir los woff2 en local.
