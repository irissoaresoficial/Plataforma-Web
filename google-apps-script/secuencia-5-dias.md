# La secuencia de cinco días — el texto, guardado

Estos cinco correos salían del Apps Script con el Gmail de Iris. El 19 de
octubre Gerson decidió que **todo el correo pasa a Resend**, así que el envío
se ha quitado de Google.

El texto NO se ha perdido: está aquí entero, tal y como estaba escrito, para
volver a montarlo sobre Resend cuando la comunidad abra de verdad. Rehacerlo
pide dos cosas que hoy no existen y que no se improvisan: un reloj que dispare
cada día (Vercel Cron) y guardar en Firestore por qué paso va cada persona.

Mientras tanto no se manda: un correo que sale dos veces, o que llega de un
sistema del que ya te diste de baja en el otro, es peor que no mandarlo.

---

```js
var SECUENCIA = [
  {
    dia: 1,
    asunto: 'Por qué se te repite',
    cuerpo:
      '<p>Hola {nombre},</p>' +
      '<p>Ayer viste dos números y lo que se activa entre esa persona y tú. Hoy te cuento de dónde sale eso.</p>' +
      '<p>En todas las familias hay algo que no se habló: una deuda, alguien que se fue, una muerte temprana, un negocio que se hundió. Nadie lo cuenta, pero se hereda igual. Y no se hereda en forma de historia, sino de conducta: prisa por irte, miedo a pedir, dificultad para quedarte donde estás bien.</p>' +
      '<p>Por eso cambias de trabajo, de ciudad o de pareja y a los seis meses estás en el mismo punto. No es tu carácter. Es una historia que sigue abierta y que se resuelve sola en cada generación hasta que alguien la mira.</p>' +
      '<p>Mañana te cuento qué pasa cuando alguien la mira.</p>'
  },
  {
    dia: 2,
    asunto: 'El mismo mes malo, tres generaciones seguidas',
    cuerpo:
      '<p>Hola {nombre},</p>' +
      '<p>Una mujer vino porque cada octubre se le hundía el negocio. Lo había probado todo: cambiar de proveedor, de local, de precios. Cada octubre, lo mismo.</p>' +
      '<p>Levantamos su línea familiar. Su padre perdió la empresa un octubre. Su abuelo perdió la casa otro octubre. Nadie se lo había contado nunca con esas palabras: en su casa eso era "la mala racha de otoño".</p>' +
      '<p>No hizo falta nada mágico. Lo vio, entendió qué parte era suya y qué parte no, y ese año hizo algo distinto en octubre a propósito. Ya van dos octubres seguidos sin caída.</p>' +
      '<p>Lo que cambia no es la fecha. Es que dejas de repetir a ciegas.</p>'
  },
  {
    dia: 3,
    asunto: 'Entenderlo no es cambiarlo',
    cuerpo:
      '<p>Hola {nombre},</p>' +
      '<p>Te voy a decir algo que va contra mi propio interés: entender de dónde viene lo tuyo, por sí solo, no te cambia la vida.</p>' +
      '<p>Lo he visto muchas veces. La persona sale de la sesión con todo clarísimo, y a los tres meses está otra vez en lo mismo. Porque un patrón que lleva tres generaciones funcionando no se desmonta en una tarde. Se desmonta a base de mirarlo por partes, una cada vez, durante meses.</p>' +
      '<p>Por eso estoy abriendo un grupo pequeño: cada mes miramos una parte de tu historia familiar y sueltas algo concreto. Un paso al mes, no un curso de seis meses que se acaba.</p>' +
      '<p><a href="{comunidad}">Aquí puedes ver de qué va</a>. Si no es tu momento, no pasa nada: los correos de estos días son tuyos igualmente.</p>'
  },
  {
    dia: 5,
    asunto: 'Las diez primeras',
    cuerpo:
      '<p>Hola {nombre},</p>' +
      '<p>Te escribo por última vez sobre esto.</p>' +
      '<p>El grupo abre con diez personas y las diez primeras se quedan con el precio de lanzamiento mientras sigan dentro. No es una prisa inventada: es un grupo pequeño porque cada mes se revisa un caso en voz alta, y con cuarenta personas eso no se puede hacer.</p>' +
      '<p><b>Para quién no es:</b> si lo que buscas es que te digan qué va a pasar, esto no es para ti. Aquí se trabaja con lo que ya está pasando.</p>' +
      '<p><b>Para quién sí:</b> si llevas años viendo el mismo final y ya te has cansado de explicártelo con la fuerza de voluntad.</p>' +
      '<p><a href="{comunidad}">Guardar mi sitio</a></p>'
  }
];
```
