# La marca, en reglas

**Esto manda.** Antes de tocar un color, una letra, un radio o un botón —en la
web o en la plataforma— se mira aquí. Lo que no esté en este archivo, no se usa.

Los valores de abajo no son una propuesta: son los que hay hoy en el código,
sacados de `apps/web/app/globals.css` y `apps/plataforma/src/app/globals.css`.
Si alguna vez dejan de coincidir, manda el código y se corrige este archivo —
nunca al revés y nunca a ojo.

---

## 1. La regla madre

Son dos aplicaciones y **una sola marca**. Quien pasa de sabiduria33.com a
app.escueladesabiduria33.com no puede notar que ha cambiado de sitio: sólo que
ha entrado en casa.

De ahí salen las tres prohibiciones:

- **Ni una tercera tipografía.** Ninguna. Ni de acento, ni «sólo para este
  titular», ni la del sistema porque queda más limpia.
- **Ni un color escrito a mano.** Si hace falta uno que no está, se añade
  aquí primero y se usa después.
- **Ni un radio suelto.** Se usa el token; si ninguno encaja, el problema es
  el diseño, no el token.

---

## 2. Tipografía

**UNA familia. Una sola, en la web y en la plataforma.**

Lo decidió Gerson el 18 de octubre: «veo muchas tipografías, ajusta máximo una
sola tipografía en toda la página web y la plataforma, pero hazlo bien». Y
antes, dos veces: «la tipografía es minimalista, Apple style modern light».

Es lo que hace Apple y es lo que pedía: una familia, y el contraste se saca de
los pesos, los tamaños y el espacio — no de meter una segunda letra.

| Para qué | Familia | Variable |
|---|---|---|
| Todo, en la web | **Instrument Sans** | `--f-texto` → `--sans` y `--serif` |
| Todo, en la plataforma | **Instrument Sans** | `--f-texto` → `--font-ui` y `--font-display` |

`--serif` SE QUEDA COMO NOMBRE en la web y apunta a la sans. Son más de
trescientas reglas en seis mil líneas las que lo usan: renombrarlas una a una
es buscar y reemplazar con riesgo de dejarse alguna, y no gana nada. El token
manda, y hoy manda la sans.

Fraunces **ya no se descarga en la web**: desde que `--serif` apunta a la sans
no la usa ni una regla, así que pedírsela a `next/font` era traerse una familia
variable entera en cada visita para no pintar con ella ni una letra.

### Cursiva: ninguna, en ningún sitio

Gerson, el 18 de octubre: **«no quiero tipografía cursiva en NADA»**. Y es una
regla, no una preferencia de ese día: no hay un solo `font-style: italic` en
todo el repositorio, y las dos hojas de estilo lo apagan de raíz —`em`, `i`,
`cite`, `dfn`, `var` y `address` salen rectos— para que no vuelva a entrar uno
por descuido.

Lo que hacía la cursiva lo hace ahora **el salto de línea**. «Por qué se
repite / siempre lo mismo» se lee igual de partida en dos, y además se lee así
en un móvil, donde una palabra inclinada en un titular grande sólo pierde
legibilidad.

Los `<em>` que quedan en el marcado **no se borran**: para un buscador y para
un lector de pantalla siguen siendo énfasis, que es para lo que existe la
etiqueta. Lo único que cambia es que ya no se dibujan torcidos.

En CSS se usan **siempre** `var(--serif)` y `var(--sans)` en la web, y
`var(--font-display)` y `var(--font-ui)` en la plataforma. Nunca el nombre de
la familia a pelo: el día que cambie una, cambia en un sitio.

> **Esto ya está resuelto.** Aquí decía que las dos aplicaciones no se veían
> iguales: en la web los titulares iban en Fraunces y en la plataforma en la
> sans. Con la decisión de una sola familia, las dos van igual y la
> discrepancia desaparece — que era lo que esta nota pedía que se decidiera.

Fraunces sigue viva en **un** sitio y sólo en uno: `--font-doc`, en la
plataforma, que es el estudio que se imprime y se le entrega a la clienta. Eso
es un documento, no interfaz, y va con las tres letras de abajo.

### Los pesos

| Token | Valor | Dónde |
|---|---|---|
| `--peso-fino` | 300 | Titulares grandes |
| `--peso-texto` | 400 | Texto corrido |
| `--peso-medio` | 500 | Rótulos pequeños, botones |

Por encima de 500 no se sube. Un titular no se enfatiza engordándolo.

### La escala

| Token | Valor |
|---|---|
| `--t-h1` | `clamp(34px, 5vw, 62px)` |
| `--t-h2` | `clamp(27px, 3.4vw, 44px)` |
| `--t-h3` | `clamp(20px, 1.9vw, 25px)` |
| `--t-lead` | `clamp(19px, 2.2vw, 28px)` |
| `--t-cuerpo` | `clamp(16px, 1.05vw, 17px)` |
| `--t-nota` | `16px` |
| `--t-cifra` | `clamp(38px, 4.6vw, 56px)` |
| `--t-cifra-xl` | `clamp(52px, 8vw, 96px)` |

Ningún `font-size` en píxeles sueltos fuera de esta tabla.

### Las tres letras del documento, aparte

El estudio que se imprime y se le entrega a la clienta usa **Cormorant
Garamond**, **Cinzel** y **Karla**. Eso **no es interfaz**: es un documento, y
ahí la serif es la decisión correcta. No se tocan y no cuentan como «terceras
tipografías».

---

## 3. Color

| Token | Valor | Qué es |
|---|---|---|
| `--vino` | `#451a25` | El color de la casa. Botones sólidos, titulares |
| `--oro` | `#a9884f` | El dorado de adorno: filetes, puntos, bordes |
| `--oro-tinta` | `#7d5f1e` | El dorado **que sí se lee** como texto sobre claro |
| `--oro-luz` | `#e2cda2` | El dorado sobre fondo oscuro |
| `--tinta` | `#221d1f` | El negro de leer |
| `--papel` | `#ffffff` | El fondo claro |
| `--arena` | `#f1ede4` | El fondo crema |
| `--linea` | `#e9e5df` | Las rayas finas |

En la plataforma, además:

| Token | Valor | Qué es |
|---|---|---|
| `--bg` | `#ece6da` | El fondo. Bajado el 20 de octubre de 2026: con `#f7f4ef` la tarjeta blanca quedaba a 1,10:1 y no se veía. Ahora 1,24:1, y `--text-4` sigue en 4,56:1 encima |
| `--border` | `#e4ded2` | El borde de tarjeta, subido con el fondo |
| `--bloque` | `var(--vino)` | La pieza oscura que ancla una pantalla clara. **Una por pantalla.** En oscuro, `#3a1a22` |
| `--sobre-bloque` | `#fbf6ee` | La tinta sobre el bloque (13,7:1) |
| `--accion` | `#451a25` | El vino exacto de la web. Antes era `#4a1a26`, casi igual, que es peor que distinto |

Las tintas de la ficha de Kábala, sólo para el método (no son colores de
interfaz: son los de la ficha que Iris rellena a mano, y cada uno significa
algo). Mismo valor en claro y en oscuro:

| Token | Valor | Qué es |
|---|---|---|
| `--ficha-azul` | `#2c5d9e` | Plano bloqueado, aprendizaje |
| `--ficha-rojo` | `#c0392b` | Ayuda espiritual, eje o plano en tensión |
| `--ficha-verde` | `#4c9a5a` | Maestría, punto verde |
| `--ficha-amarillo` | `#e5b63c` | Portal que se repite (con `--vino` encima) |

Los colores de la agenda, uno por clase de cita (noviembre de 2026). Aquí el
color **rellena** el bloque entero: en una semana llena lo primero que hay que
ver es qué es cada cosa. Tres y no más, los tres tipos que existen:

| Token | Claro | Oscuro | Qué es |
|---|---|---|---|
| `--cita-sesion` · `-tx` | `--vino` · `#fbf6ee` (13,7:1) | `#7c2c3f` · `#fbf6ee` (8,5:1) | La sesión de pago |
| `--cita-sinergia` · `-tx` | `#f0c24f` · `--vino` (8,8:1) | `#f0c24f` · `#2a0f16` (10,6:1) | El estudio gratis: lo que más salta |
| `--cita-seguimiento` · `-tx` | `#f4d3df` · `--vino` (10,7:1) | igual | El seguimiento |
| `--cita-hoy` · `-tx` | el oro vivo de la sinergia | igual | El círculo del día de hoy |

Una cita por confirmar lleva el mismo color con un filo de trazos; una anulada
pierde el color y va tachada.

### El cristal de la plataforma (noviembre de 2026)

La plataforma pasa, pantalla por pantalla, a una ventana de cristal sobre una
foto desenfocada (la referencia «liquid glass» que pasó Gerson). Se enciende con
`data-cristal` en la raíz; qué pantallas lo llevan lo decide la lista `CRISTAL`
de `Shell.tsx`. Hoy: **todas las pantallas menos Feng Shui**, que tiene su
propio chat y entra cuando lo cierre. Valores exactos en
`apps/plataforma/src/app/globals.css`, sección «EL CRISTAL».

| Token | Qué es |
|---|---|
| `--cristal-foto` | La foto del fondo: `fondo-cristal.webp`, la tablilla de la cuenta con la amatista, ya desenfocada |
| `--cristal-velo` | El velo sobre la foto. Es lo que deja la letra a 4,5:1 encima del cristal |
| `--cristal-ventana` | La ventana grande. **No desenfoca**: si lo hiciera, sus paneles dejarían de esmerilar la foto |
| `--cristal-panel` · `--cristal-filtro` | Los paneles de dentro. El filtro está a `none` a propósito: la foto ya viene desenfocada y desenfocar cada panel hacía ir lenta la plataforma. Sólo desenfoca el dock |
| `--cristal-barra-densa` | La barra del documento, que flota encima del papel: casi opaca, o la letra se mezcla con el folio |
| `--cristal-barra` · `--cristal-campo` | La barra en píldora de arriba y el campo «dónde estás» |
| `--cristal-riel` | La columna, que flota a la izquierda. Plegada es un riel de iconos |
| `--cristal-dock` | Por debajo de 1130 px el riel pasa a dock abajo. El cristal con más cuerpo |
| `--nav-activo` · `--nav-activo-tx` | «Estás aquí». En claro, el vino; en oscuro, un círculo claro con el vino dentro |
| `--r-ventana` · `--r-panel` · `--r-medio` | Radios fluidos del cristal: `clamp(18px,1.9vw,40px)`, `clamp(14px,1.5vw,30px)`, `clamp(11px,1.15vw,22px)` |

Dentro del cristal, los grises de la letra se mueven para no bajar de 4,5:1
medido sobre el píxel pintado: en claro bajan a `#514644`/`#574c49`, en oscuro
suben casi a blanco (`#f1eaec` a `#e6dce0`). En cristal la jerarquía la hacen
el tamaño y el peso, no lo apagada que esté la letra. Nada se mueve solo: el
polvo que sube no se pinta en cristal, y lo único que se anima es el toque
(aclara al pasar, encoge a 0,94 al pulsar).

Más reglas del cristal, todas medidas:

- **La página no se mueve.** Barra, riel y ventana se quedan quietos; sólo
  corre lo de dentro de la ventana. Lo que se pega arriba al desplazar usa
  `--pegado`, y para volver arriba se usa `subeArriba()` (`lib/arriba.ts`),
  nunca `window.scrollTo`.
- **Lo pegado es opaco.** Una cabecera que se queda fija mientras pasa el
  contenido por debajo va con `--surface-solid`, nunca con `--surface`.
- **En cristal el dorado de texto es `--gold-deep`** y en oscuro el rojo de
  aviso sube a `#f6b0a9`: los de siempre se quedaban por debajo de 4,5:1.
- **Se entra en claro.** El oscuro es una elección del botón de la luna, no se
  copia del ordenador.
- **Pesos: sólo se descargan 400 y 500** y `font-synthesis-weight` está
  apagado. Cualquier regla que pida 600 o 700 recibe el 500.

Y los que cambian según el bloque (`.claro`, `.arena`, `.vino`):
`--bg`, `--tx`, `--tx-2`, `--tx-3`, `--acento`, `--superficie`.

**Un color se usa por su token, nunca por su hexadecimal.** Si se escribe
`#451a25` en una regla, el día que la marca cambie de granate quedará uno
suelto que nadie encuentra.

### El dorado y el contraste

`--oro` (`#a9884f`) **no vale como texto** sobre fondo claro: no llega al 4,5:1
que pide la norma. Para texto va `--oro-tinta`. Y el contraste se comprueba
**sobre el píxel pintado**, no sobre el token: si detrás hay un vídeo o un
degradado, el token no sabe lo que hay debajo.

---

## 4. Formas

| | Web | Plataforma |
|---|---|---|
| Radio normal | `--radio` 4 px | `--r` 15 px |
| Radio chico | `--radio-chico` 3 px | `--r-sm` 11 px |
| Pastilla | `--radio-pildora` 100 px | `--r-pill` 100 px |
| Blando | `--radio-suave` 25 px | — |
| Medio | `--radio-medio` 12 px | — |

Los dos últimos entraron el 18 de octubre de 2026 con la portada nueva, que es
de canto blando: la sección crema monta sobre el vídeo con la esquina
redondeada y las fichas van en bloques mullidos. Con 4 px no es esa portada.

**Sólo los usa `.casa`**, o sea la portada. El resto de la web sigue recta. Si
alguna vez se usan fuera de ahí, o esto deja de ser cierto o hay que decidir de
una vez si la web entera pasa a canto blando — que es justo la decisión que
sigue abierta aquí abajo.

> **Esto no cuadra y está pendiente de que lo decidas.** La web es casi
> cuadrada (4 px) y la plataforma redondeada (15 px). Son dos lenguajes. Hay
> que elegir uno para los dos; mientras no se decida, **cada app usa el suyo y
> no se mezclan**. No lo cambio por mi cuenta: ya pasó una vez y salió mal.

---

## 5. El botón

Una sola forma de pedir en toda la casa. En la web es `.portada-cta` y, cuando
es la petición principal, `.portada-cta.cta-solida`: disco granate con la
flecha dorada.

- **Uno solo por pantalla.** Dos botones del mismo peso no son dos opciones:
  son una duda.
- El secundario habla más bajo: mismo botón sin `cta-solida`.
- No se inventa un botón nuevo para una sección nueva.

---

## 6. La voz

Cómo se escribe en las dos aplicaciones:

- **Castellano llano.** Ni energía, ni vibración, ni despertar, ni alineación.
  Si una frase no se la dirías a alguien en una cafetería, no va.
- **Frases cortas.** Un punto antes que una coma.
- **Se habla de tú**, y de lo que le pasa a quien lee, no de lo que ofrecemos.
- **Dos filtros antes de publicar una línea:** ¿esto lo compraría alguien?
  ¿esto lo entendería alguien?
- Los rótulos de una ficha son una pregunta corta («Qué es», «Para quién»), no
  un sustantivo abstracto.

---

## 7. Lo que no se hace nunca

Esto no es estilo: es lo que mete en un lío a la clienta.

- **No se inventa un dato.** Lo que no esté decidido va como `PENDIENTE` y sale
  marcado en rojo. Un precio o unas fechas verosímiles puestos «para que no
  quede feo» son poner a alguien a comprar algo que no existe.
- **No se inventan reseñas ni clientes.** `TESTIMONIOS` está vacío a propósito.
  Ni personas con foto de banco de imágenes, ni puntuaciones de webs donde Iris
  no está.
- **No se ponen logos de marcas que no son clientes.**
- **No se tacha un precio** al que no se haya vendido de verdad en los treinta
  días anteriores (Ley 7/1996, art. 20). Hoy el 150 € es real, por eso se puede
  tachar.
- **No se guarda la IP entera** de nadie. País y ciudad, y antes tiene que
  estar en la política de privacidad.
- **No se usan tipografías de pago** enlazadas desde el CDN de otro.

---

## 8. Cómo se trabaja

Las reglas de proceso, que son las que fallaron el 16 de octubre de 2026 y
costaron una tarde entera de trabajo tirada:

1. **Un cambio por entrega.** Se sube, se mira, y entonces el siguiente. Cuatro
   cambios grandes a la vez y, cuando algo se rompe, no se sabe cuál fue.
2. **La portada no se toca sin preguntar.** Es la pantalla que paga.
3. **Se mide, no se mira por encima.** Contraste, encuadre y solapes se
   comprueban con una captura y un número, en 1440×900 **y** en 390×844.
4. **Se borra poco.** Lo que estorba se deja de pintar; el componente se queda
   en el repositorio.
5. **Cuando el cliente dice que ha empeorado, ha empeorado.** No se discute: se
   revierte y después se habla.
