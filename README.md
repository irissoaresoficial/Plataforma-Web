# Web de Iris Soares

Web en Next.js (App Router) + Framer Motion.

La web es el núcleo y cada apartado es una landing propia, enlazada desde el pie:

| Ruta | Qué es |
| --- | --- |
| `/` | Marca personal. Cuenta el problema, quién es Iris y qué plantea. Lleva el chat que reserva sesiones. |
| `/sinergia` | La prueba gratis: la herramienta de captación por la que entra el tráfico de redes. |
| `/cursos` | Los cursos y talleres en directo, con vídeo de presentación y reserva de plaza. |
| `/membresia` | La comunidad, en lista de espera: reservas ahora y guardas el precio de lanzamiento. |

Lo que se cambia a mano (cursos, precios, vídeo, contacto) está todo en
**`content/site.ts`**. No hace falta tocar nada más.

## Arrancar en local

```bash
npm install
npm run dev          # http://localhost:3000
```

Para probar la versión real: `npm run build && npm start`.

## Reservas: calendario, hoja de cálculo y correos

El chat de la portada reserva sesiones de verdad. Todo el trabajo lo hace un
**Google Apps Script** gratuito que vive en la cuenta de Google de Iris, así que
no hace falta contratar ningún servicio de correo ni dar de alta claves de API.

Cuando alguien termina la conversación del chat:

1. La reserva se guarda como una fila en la hoja de cálculo (nombre, correo, fecha
   de nacimiento, lo que se le repite, día y hora).
2. Se crea el evento en el Google Calendar de Iris **invitando a la persona**, así
   que Google le manda la invitación y la cita le queda guardada en su calendario.
3. Se envía un correo de confirmación a la persona y un aviso a Iris con todos los
   datos para preparar la sesión.

Además, el chat **lee los huecos reales** del calendario de Iris: solo ofrece días y
horas que tiene libres.

### Instalación (una vez, unos 10 minutos)

1. Crea una hoja de cálculo nueva en Google Drive. Será el registro de reservas.
2. En la hoja: **Extensiones → Apps Script**. Borra lo que haya y pega el contenido de
   [`google-apps-script/reservas.gs`](google-apps-script/reservas.gs).
3. Cambia el bloque `CONFIG` del principio del script: como mínimo `IRIS_EMAIL` y
   `SECRET` (inventa una clave larga). Si tienes enlace fijo de videollamada, ponlo en
   `MEETING_URL`.
4. Rueda dentada (**Configuración del proyecto**) → zona horaria **Europe/Madrid**.
5. Pulsa **Ejecutar** sobre la función `probar` una vez y acepta los permisos que pida
   (calendario, hoja y correo). En el registro debe salir cuántos días libres encuentra.
6. **Implementar → Nueva implementación → Aplicación web**:
   - *Ejecutar como*: yo (la cuenta de Iris)
   - *Quién tiene acceso*: cualquier usuario
7. Copia la URL que acaba en `/exec`.
8. En la web, crea un archivo `.env.local` (o las variables de entorno de tu hosting)
   copiando `.env.example`:

   ```
   APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXXX/exec
   APPS_SCRIPT_SECRET=la-misma-clave-del-script
   ```

9. Reinicia la web y prueba una reserva de principio a fin.

> Cada vez que cambies el código del script hay que volver a **Implementar → Gestionar
> implementaciones → editar → Nueva versión**, o la URL seguirá sirviendo lo anterior.

## Los correos: Resend

Desde el 19 de octubre, las confirmaciones de quien se apunta por la web salen
por **Resend**, desde `escueladesabiduria33.com` y con SPF y DKIM firmados —que
es lo que hace que no caigan en «correo no deseado»—. Antes salían del Gmail de
Iris a través del Apps Script: tope de cien al día, remite de @gmail.com y
ninguna forma de saber si llegaron.

Tres variables en Vercel (*Production, Preview y Development* en las tres):

| Variable | Qué es |
|---|---|
| `RESEND_API_KEY` | La clave, con permiso **Sending access** |
| `RESEND_FROM` | `Iris Soares <hola@escueladesabiduria33.com>` |
| `RESEND_REPLY_TO` | El Gmail donde Iris lee, para que las respuestas lleguen |

**Sin `RESEND_API_KEY` no se rompe nada**: los correos siguen saliendo por el
Apps Script exactamente como antes. Es lo que permite desplegar el código antes
de tener la clave puesta.

### Cómo se evita el correo por duplicado

Los dos sistemas tocan el mismo lead, así que la web le dice al Apps Script lo
que ha conseguido hacer: si Resend mandó, le pasa `sinCorreo: true` y el script
sólo apunta la fila en la hoja de Iris. Si Resend falló, no le pasa nada y el
script manda los correos como siempre. Ver `guardarLead()` en
`google-apps-script/reservas.gs`.

### Lo que sigue saliendo de Google

Las reservas de consulta y la secuencia de cinco días de la sinergia. Eso pide
además un reloj (Vercel Cron) y es la fase dos. La hoja de cálculo se queda en
cualquier caso: es donde Iris mira sus apuntados.

### Ver un correo antes de mandarlo

`lib/correo.ts` exporta `vistaPreviaDeLead` y `vistaPreviaDeAviso`, que
devuelven el HTML sin enviar nada. Un correo roto no se arregla después de
mandarlo: es la única pieza de esta web que no se puede volver a desplegar.

## Correos captados y secuencia de venta

Los cuatro formularios de la web mandan el correo al mismo Apps Script, que lo guarda
en la pestaña **Leads** con su origen:

| Origen | De dónde viene | Qué pasa después |
| --- | --- | --- |
| `sinergia` | La prueba gratis (`/sinergia`) | Recibe el resultado por correo y entra en la secuencia |
| `membresia` | La lista de espera, en la portada y en `/membresia` | Se guarda (con WhatsApp si lo deja) y avisa a Iris |
| `curso` | La reserva de plaza en `/cursos` | Se guarda y avisa a Iris para que mande el enlace de pago |

**La secuencia** solo se manda a quien llega por la prueba gratis, que es por donde
entra el tráfico de redes. Son cinco correos repartidos en cinco días: el resultado,
por qué se repite, un caso real, la diferencia entre entenderlo y cambiarlo, y la
oferta de la comunidad. El texto está en la constante `SECUENCIA` del script: se
edita ahí, sin tocar la web, y se puede cambiar la oferta del final por un curso.

Para que salgan solos hay que crear el activador diario (paso 8 de la instalación).
Cada persona recibe como mucho un correo al día, y todos llevan enlace de baja en un
clic, que marca la columna **Baja** de la hoja.

Si Gmail se queda sin cuota diaria (unos 100 correos en cuentas gratuitas), lo que
falte sale al día siguiente: no se pierde nadie.

### Qué pasa si el script no está configurado

La web funciona igual, pero el chat no puede reservar: ofrece huecos de plantilla
(laborables) y, al terminar, avisa a la persona de que escriba por correo en lugar de
decirle que la cita está confirmada. Nunca da por buena una reserva que no se ha
guardado en ningún sitio.

Los formularios se comportan igual: si el correo no se puede guardar, lo dicen en vez
de mostrar "guardado". La única excepción es la prueba gratis, que enseña el resultado
en pantalla de todas formas (ya se lo ha ganado) y avisa de que no le llegará nada por
correo.

### Ajustes habituales del script

Todo está en el bloque `CONFIG` de `reservas.gs`:

- `HOURS`: los huecos que se ofrecen cada día (`['10:00', '12:30', '16:00', '18:30']`).
- `DURATION_MIN`: duración de la sesión, 90 minutos.
- `DAYS_AHEAD`: cuántos días vista se muestran en el chat.
- `MIN_DAYS_NOTICE`: margen mínimo desde hoy para poder reservar.
- `CALENDAR_ID`: `'primary'` usa el calendario principal; también acepta el ID de un
  calendario aparte si Iris prefiere separar las sesiones.

## El mapa del código (codebase-memory)

Este repositorio ya es grande: dos aplicaciones, 274 archivos indexados y una
hoja de estilos de más de siete mil líneas. Leerlo archivo por archivo cada vez
que hay que tocar algo cuesta una barbaridad de tokens y es lento.

`codebase-memory-mcp` lo arregla: indexa el proyecto entero en un grafo —qué
función llama a cuál, qué archivo importa qué, dónde están las rutas— y
responde preguntas de estructura en milisegundos sin abrir los archivos. En
este repositorio tarda **7 segundos** en indexar y saca **3.102 nodos y 9.186
relaciones**.

Es local: no sube el código a ningún sitio y no necesita ninguna clave.

### Instalarlo (una vez por ordenador)

```bash
curl -fsSL https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.sh | bash
```

Deja el binario en `~/.local/bin`, lo añade al PATH y configura solo los
agentes que encuentre instalados. Después hay que **reiniciar el agente**.

En Windows es `install.ps1`; está en el README del proyecto:
https://github.com/DeusData/codebase-memory-mcp

### Indexar este proyecto

Con el agente ya reiniciado basta con pedirle «indexa este proyecto». A mano:

```bash
codebase-memory-mcp daemon start
codebase-memory-mcp cli index_repository --repo-path "$(pwd)" --mode full
```

### Mantenerlo al día — LO IMPORTANTE

El índice **no se actualiza solo en todos los casos**, y conviene saber
exactamente cuándo sí y cuándo no, porque un mapa viejo contesta cosas que ya
no son verdad:

| Cómo se indexó | ¿Se actualiza solo? |
|---|---|
| Desde una sesión del agente abierta **en esta carpeta** | Sí: el vigilante mira los cambios de git |
| Desde la terminal (`cli index_repository`) | **No.** Se queda como estaba |
| Desde una sesión abierta en **otra** carpeta | **No** |

Por eso en este repositorio hay un atajo:

```bash
npm run mapa
```

Tarda siete segundos y deja el mapa igual que el código. **Después de bajar
cambios (`git pull`) o de una tanda de trabajo, se pasa.**

Y para que las sesiones nuevas se indexen y se vigilen solas, una vez por
ordenador:

```bash
codebase-memory-mcp config set auto_index true
```

### Dos mapas distintos, que no se hablan

El índice vive en el ordenador que lo hizo, no en el repositorio. El que tiene
Gerson en su Mac y el que uso yo en el servidor son **dos copias
independientes**: actualizar una no toca la otra. De ahí que `npm run mapa` haya
que pasarlo en cada sitio.

### La interfaz

```bash
codebase-memory-mcp config set ui_enabled true
```

Y se abre `http://localhost:9749`. Tiene el mapa de carpetas en 3D
(«Architecture»), el grafo entero («Galaxy»), un lector de código con sus
dependencias al lado («Explore») y qué quedó sin indexar («Coverage»).

### Qué hay en el repositorio

`.mcp.json`, en la raíz. Es lo único que se versiona: dice que este proyecto
usa el servidor y lo llama por su nombre, no por una ruta absoluta —así vale
igual en un Mac que en Linux—. El binario y la configuración del agente son de
cada ordenador y no entran aquí.

## Contenido pendiente

Todo lo que falta por rellenar sale **marcado en rojo en la propia web**, para verlo de
un vistazo. Se rellena en `content/site.ts`:

- El curso: título, fechas, horario, precio, descripción, lo que se ve y el enlace del vídeo.
- Lo que incluye la membresía (tres huecos).
- El correo de contacto y el WhatsApp.

Aparte, sigue pendiente una foto de Iris mejor que la actual, que tiene el equipo de
cámara detrás.

## Archivo

En `app/_archive/` está la landing de la formación de 12 semanas, retirada de la web
porque todavía no está lanzada. No se publica: las carpetas que empiezan por `_` no
crean ninguna dirección.
