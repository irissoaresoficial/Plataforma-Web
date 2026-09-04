# Web de Iris Soares

Web en Next.js (App Router) + Framer Motion. Cuatro páginas:

| Ruta | Qué es |
| --- | --- |
| `/` | Página principal. Dolor → por qué pasa → cómo funciona → lista de espera de la comunidad. Lleva el chat que reserva sesiones. |
| `/sinergia` | Herramienta gratuita de captación: dos nombres, dos fechas y un resultado a cambio del correo. |
| `/escuela` | La formación y la membresía. |
| `/cursos` | Los cursos sueltos con fecha. |

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

### Qué pasa si el script no está configurado

La web funciona igual, pero el chat no puede reservar: ofrece huecos de plantilla
(laborables) y, al terminar, avisa a la persona de que escriba por correo en lugar de
decirle que la cita está confirmada. Nunca da por buena una reserva que no se ha
guardado en ningún sitio.

### Ajustes habituales del script

Todo está en el bloque `CONFIG` de `reservas.gs`:

- `HOURS`: los huecos que se ofrecen cada día (`['10:00', '12:30', '16:00', '18:30']`).
- `DURATION_MIN`: duración de la sesión, 90 minutos.
- `DAYS_AHEAD`: cuántos días vista se muestran en el chat.
- `MIN_DAYS_NOTICE`: margen mínimo desde hoy para poder reservar.
- `CALENDAR_ID`: `'primary'` usa el calendario principal; también acepta el ID de un
  calendario aparte si Iris prefiere separar las sesiones.

## Contenido pendiente

Marcado en el propio diseño: foto y vídeo reales de Iris, testimonios y los ponentes
invitados de la formación.
