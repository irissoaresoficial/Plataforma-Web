'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'es' | 'pt' | 'en';

export const COPY = {
  es: {
    n1: 'Cómo funciona', n2: 'Ver mi número', n3: 'Cursos', n4: 'Membresía', book: 'Reservar', free: 'Gratis',
    kick: 'Numerología transgeneracional · online desde 2010',
    /* EL TITULAR CUENTA UNA HISTORIA, y el personaje es la familia — no Iris
       ni quien entra. Iris no le interesa a nadie que no la conozca, y hablarle
       a la persona de su propia vida en la primera frase suena a que se la
       estás contando sin haberle preguntado. La familia hace las dos cosas que
       este negocio necesita: le quita la culpa —esto no lo empezaste tú— y le
       deja el trabajo —pero lo puedes cerrar tú—. */
    /* MÁS DOLOR Y MÁS CLARO. La versión anterior contaba lo que pasa en una
       familia; ésta dice lo que le pasa a QUIEN ESTÁ LEYENDO. «Lo estás
       pagando tú» es la frase que hace levantar la vista: no describe un
       fenómeno, señala un precio que se está pagando ahora mismo. */
    h1a: 'Lo que en tu familia nunca se contó,', h1b: 'lo estás pagando tú.',
    /* La tercera línea en dorado se ha retirado del titular: ese trabajo lo hace
       ahora la rama dorada del árbol, que aparece sin decir nada. */
    /*
     * TRES LÍNEAS EN TODA LA PORTADA, Y NO UNA MÁS.
     *
     * Aquí había tres párrafos. Sobre un vídeo a pantalla completa, un párrafo
     * no se lee: se ve pasar. Así que cada paso es UNA frase, del tamaño de un
     * titular, y lo que explica queda para el bloque de debajo, que es donde se
     * lee de verdad.
     *
     * El orden es el de una conversación: primero le quito la culpa, después le
     * digo por qué le ha llegado a él, y solo al final le digo qué le doy yo a
     * cambio de su dinero. Pedir antes de eso es pedir a un desconocido.
     */
    /*
     * LAS DOS FRASES QUE DUELEN.
     *
     * «No es tu carácter, empezó antes de que nacieras» era verdad y no dolía:
     * describe un fenómeno. Nadie se reconoce en un fenómeno.
     *
     * La primera ahora nombra a personas concretas —tu madre, tu abuela— y
     * termina en la frase exacta que se ha dicho a sí misma la persona que está
     * leyendo. Ahí es donde se levanta la vista.
     *
     * Y la segunda no explica nada: pone la factura encima de la mesa. «Otros
     * treinta años» es un número que se siente en el cuerpo, y deja UNA salida,
     * que además es justo lo que hay debajo: el botón.
     */
    h1p1: 'Tu madre lo vivió. Tu abuela también. Y tú jurabas que a ti no te iba a pasar.',
    h1p2: 'Puedes aguantarlo otros treinta años.',
    h1p2b: 'O mirarlo una vez.',
    hsub: 'Te enseño de dónde viene lo que se repite. Y cómo se corta.',
    hcta: 'Reservar mi consulta', hcta2: 'Ver mi número gratis', hbadge: 'Online · ES / PT / EN',
    s1: 'personas atendidas', s2: 'desde', s3: 'idiomas',
    p_lab: 'A ver si te suena',
    p1: 'Cambias de trabajo y a los seis meses te sientes igual.',
    p2: 'Cambias de pareja y discutís por lo mismo.',
    p3: 'Ganas más y a fin de mes sigue sin quedar nada.',
    p4: 'Cargas con algo que ni siquiera te pasó a ti.',
    p_punch: 'Y llevas años jurando que tú no ibas a ser así.',
    b_lab: 'Por qué pasa',
    b_h: 'No es tu carácter. Es una historia que nadie cerró.',
    b_p1: 'En toda familia hay algo que no se habló: un amante que nunca se reconoció, una enfermedad psiquiátrica, alguien que estuvo preso. Nadie lo cuenta, y aun así pasa de generación en generación.',
    b_p2: 'Con tu nombre y tu fecha se ve en qué generación empezó, cómo llegó hasta ti y qué parte te toca soltar.',
    /*
     * QUÉ ES ESTO. El bloque que faltaba en toda la web.
     *
     * Se hablaba de lo que hace —«de dónde viene lo que se repite»— pero en
     * ninguna parte se decía qué ES la numerología transgeneracional. Quien
     * llegaba sin saberlo bajaba la página entera y seguía sin saberlo.
     *
     * Tiene que caber en una respuesta de bar: qué se usa, qué sale y qué NO
     * es. Ese último tercio no es relleno: «esto no adivina el futuro» es la
     * duda número uno de quien llega de un anuncio, y contestarla aquí es lo
     * que permite que el resto de la página se lea sin sospecha.
     */
    q_h: 'Se llama numerología transgeneracional.',
    q_p1: 'Tu nombre y tu fecha guardan lo que pasó en tu familia. En números se ve el patrón: qué se repite y desde cuándo.',
    q_p2: 'No adivina el futuro. Explica el presente.',
    /*
     * EL REGALO.
     *
     * No se llama «regalo» en ninguna parte, y es a propósito: la palabra pone
     * a la persona en guardia —lo gratis siempre cuesta algo— y encima no dice
     * qué es. El gancho es otro y es el natural: quien acaba de leer sobre lo
     * que se repite en una familia ya tiene a alguien en la cabeza. No hay que
     * convencerle de nada, sólo nombrarlo.
     */
    /* Un titular que no duele no es un titular. «Se te ha venido alguien a la
        cabeza» describe lo que le pasa a quien lee; esto nombra lo que le PASA
        con esa persona, que es lo que de verdad le escuece. */
    sg_h: 'Con esa persona siempre acabáis en lo mismo.',
    sg_p: 'Tu fecha y la suya. Nada más.',
    sg_cta: 'Verlo ahora',
    /*
     * EL CIERRE DE LA PORTADA: UN BOTÓN.
     *
     * Aquí había dos fichas con dos precios grandes, un tachado y tres botones.
     * Una tabla de tarifas en medio de una historia le hace a la persona la
     * pregunta equivocada: en vez de «¿quiero esto?», «¿cuál de las dos y por
     * cuánto?». El precio vive en las dos páginas que explican qué se compra, y
     * el chat lo dice en su primera respuesta.
     */
    /*
     * Y LA FRASE TIENE QUE DOLER, NO PRESENTAR.
     *
     * Decía «Vamos a mirar la tuya.» y tenía dos fallos a la vez. Uno de
     * gramática: «la tuya» ¿qué? Se apoyaba en el bloque de arriba, y quien
     * llega aquí de un salto —o quien ha bajado rápido— lee un pronombre sin
     * dueño. Y otro peor: es una frase de agenda, no de dolor. Cuenta lo que va
     * a pasar en la sesión, cuando lo que toca aquí es nombrar por qué se pide.
     *
     * «Ya sabes que no se va a ir solo» no informa de nada: repite en voz alta
     * lo que la persona lleva media página pensando. Eso es lo que mueve.
     */
    cu_h: 'Ya sabes que no se va a ir solo.',
    cu_p: 'Online, con tu historia ya preparada antes de vernos.',
    cu_num: 'Qué es la numerología transgeneracional',
    cu_kab: 'Qué es la Kábala',
    /* Lo que se lee debajo del nombre de cada puerta, ahora que son dos fichas
       y no dos enlaces sueltos: sin esto, «Kábala» es una palabra a secas. */
    cu_num_p: 'De dónde sale lo que se repite, y el precio.',
    cu_kab_p: 'El árbol, las diez puertas y el precio.',
    w_lab: 'Quién soy', w_h: 'Soy Iris. Te ayudo a liberarte de los patrones que no te pertenecen.', w_h2: 'Y a devolverlos a su origen.',
    /*
     * EL SALUDO, EN CUANTO TERMINA EL ÁRBOL.
     *
     * «Hola. Soy Iris» y no «Iris Soares · numeróloga transgeneracional». Lo
     * segundo es una tarjeta de visita; lo primero es alguien hablando. En una
     * web que se vende sobre la confianza en UNA persona, la diferencia entre
     * las dos cosas es toda la venta.
     *
     * Y el oficio va pegado al nombre, en la misma frase, porque «numeróloga
     * transgeneracional» es una palabra que casi nadie ha oído: si no se dice
     * aquí, en la línea donde la persona ya está mirando, no se dice.
     *
     * Y UN párrafo, no tres. Eran «qué miro», «cómo lo hago» y «de dónde
     * vengo» en tres bloques, y en pantalla eso es un muro. Las tres cosas
     * caben en cuatro líneas, y las tres tienen que estar: sin la primera no se
     * sabe qué compra, sin la segunda parece adivinación y sin la tercera es
     * una desconocida pidiendo dinero.
     */
    w_hola: 'Hola. Soy Iris,',
    w_oficio: 'numeróloga transgeneracional.',
    /* Termina en «esto tiene nombre», que es la entradilla literal del bloque
        de debajo: «Se llama numerología transgeneracional». El saludo deja de
        ser una ficha suelta y se convierte en la primera mitad de una frase que
        acaba en el siguiente titular. Y fuera el «desde 2010»: una fecha no
        convence a nadie que todavía no sabe qué le estás vendiendo. */
    w_que: 'Yo no lo interpreto. Lo cuento con números: tu nombre, tu fecha y las de tu línea. Y esto tiene nombre.',
    w_p1: 'Pasé años observando patrones en el mundo corporativo y descifrando qué sucede cuando nadie mira.',
    w_p2: 'En 2010 uní lo mejor de la numerología, la psicosomática clínica, las constelaciones y las terapias integrativas para crear un método práctico y profundo. El objetivo de mi consulta es solo uno: que salgas sabiendo quién eres y qué decisión tomar hoy.',
    w1: 'Derecho', w2: 'Psicología', w3: 'Psicosomática', w4: 'Descodificación', w5: 'Numerología', w6: 'Transgeneracional',
    m_lab: 'Cómo funciona', m_h: 'Tres pasos. Sin misterio.',
    m1t: 'Me das dos datos', m1p: 'Tu nombre y tu fecha. Las de tu familia, si las sabes.',
    m2t: 'Preparo tu historia', m2p: 'Dibujo lo que se repite en tu línea antes de vernos.',
    m3t: 'Nos vemos en directo', m3p: 'Lo ves en pantalla. Sales con ejercicios, informe y grabación.',
    wl_lab: 'La comunidad · próximamente',
    wl_h: 'Entenderlo lleva una sesión. Cambiarlo lleva meses.',
    wl_p: 'Un grupo pequeño. Cada mes, una parte de tu historia familiar.',
    wl_cta: 'Avísame cuando abra',
    wl_err: 'Ese correo no parece válido.', wl_done_h: 'Sitio guardado.',
    wl_more: 'Ver qué incluye y cómo funciona →',
    wl_sending: 'Guardando…', wl_fail: 'No he podido guardarlo ahora mismo. Inténtalo en un minuto o escríbeme a irissoaresoficial@gmail.com.',
    wl_done_p: 'Te escribo en cuanto abramos, y serás de las primeras en saber qué hay dentro.',
    e_lab: 'Cursos y talleres', e_h: 'Y de vez en cuando, unos días en directo.',
    e_sub: 'Un tema concreto, con tu caso encima de la mesa.',
    e_c2: 'Precio de lanzamiento', e_cta: 'Ver los cursos',
    f_lab: 'Dudas', f_h: 'Lo que me preguntan siempre.',
    f_q1: '¿Qué me llevo de la sesión?', f_a1: 'Tu historia puesta en números y explicada delante de ti, y lo que se repite señalado con nombre y fecha. Sales sabiendo de dónde viene, no con una lista de consejos.',
    f_q2: '¿Tengo que creer en algo?', f_a2: 'No. Aquí no hay religión, ni grupo, ni nada a lo que apuntarse. La cuenta se hace delante de ti y la puedes rehacer tú.',
    f_q3: '¿Sustituye a un psicólogo?', f_a3: 'No, y no lo pretende. Si estás en terapia, sigue con ella. Esto acompaña y no interfiere; puedes contárselo a tu terapeuta sin problema.',
    f_q4: '¿Qué hacéis con mis datos?', f_a4: 'Solo se usan para preparar tu sesión. No se comparten con nadie, no se venden y los borro si me lo pides: escribe un correo y ya está.',
    f_q5: '¿Esto es adivinar el futuro?', f_a5: 'No. La numerología transgeneracional mira hacia atrás, no hacia delante: de dónde viene lo que te pasa. Nadie te va a decir con quién te vas a casar ni cuándo te va a tocar la lotería.',
    f_q6: '¿Y si no me sé la fecha de mis abuelos?', f_a6: 'Se trabaja con lo que haya. Con tu fecha sola ya sale mucho, y muchas veces el propio estudio es lo que empuja a preguntar en casa. Lo que falte se añade después.',
    f_q7: '¿Cómo se calcula mi número?', f_a7: 'Se reducen por separado el día, el mes y el año de tu nacimiento, y luego se suman. El 11, el 22 y el 33 no se reducen: son números maestros. Puedes probarlo aquí mismo, en la web, sin dejar ningún dato.',
    f_q8: '¿Las sesiones son online o presenciales?', f_a8: 'Online, por videollamada. Es lo que permite atender igual desde España, Portugal o América sin que nadie tenga que coger un tren.',
    f_q9: '¿En qué idiomas?', f_a9: 'Español, portugués e inglés.',
    f_q10: '¿Hace falta preparar algo antes?', f_a10: 'Tu fecha de nacimiento y tu nombre completo de nacimiento. Si tienes a mano las fechas de tus padres y abuelos, mejor: es donde aparece lo que se repite.',
    f_q11: '¿Y si necesito cambiar la cita?', f_a11: 'Se cambia, y sin coste: escribe a irissoaresoficial@gmail.com y se busca otro hueco. Lo único, avísame con 24 horas — con menos, esa hora ya no se la puedo dar a nadie y se da por dada.',
    f_q12: '¿Puedo regalar una sesión?', f_a12: 'Sí. Escríbeme y lo montamos: la persona elige el día que le venga bien.',
    /* EL ÚLTIMO TITULAR DE LA PÁGINA, Y NO PUEDE SER EL MISMO QUE EL DE ARRIBA.
       Decía «Vamos a mirarlo juntos.» a dos pantallas de «Vamos a mirar la
       tuya.»: el mismo verbo, el mismo tono y el mismo botón dos veces. Repetir
       una llamada no la hace más fuerte, la gasta. Aquí va lo que no se ha
       dicho en toda la página y es lo que de verdad duele de esto: que lo que
       no se mira no se queda quieto — pasa a quien viene detrás. */
    c_h: 'Lo que tú no mires, lo mira quien venga detrás.', c_p: 'Empecemos por tu fecha.',
    c_btn: 'Reservar mi consulta', c_micro: 'Se reserva hablando · un minuto',
    ft_p: 'Iris Soares. Entender de dónde viene lo que se repite, y dejar de repetirlo.',
    ft_start: 'Empezar', ft_1: 'Sesión con Iris', ft_2: 'Prueba gratis', ft_3: 'Cursos y talleres', ft_4: 'La membresía',
    ft_legal: 'Legal', ft_l1: 'Aviso legal', ft_l2: 'Privacidad', ft_l3: 'Contacto',
    ft_disc: 'Las sesiones y los cursos no son un tratamiento médico ni psicológico y no sustituyen a ninguno.',
    cbook: 'Reservar', clook: 'Mirar', csee: 'Ver', cgo: 'Entrar',
    ch_title: 'Agente de Iris', ch_sub: 'Agente de IA · agenda en directo', ch_done: 'Sesión reservada',
    ch_priv: 'Soy un agente de IA, no Iris. Tus datos solo se usan para preparar tu sesión y para la cita.',
    ch_a1: 'Hola. Soy el agente de Iris y mi único trabajo es buscarte un hueco con ella. ¿Cómo te llamas?',
    /* El saludo cuando se viene del botón de Kábala. Nombra la consulta y el
       precio ANTES de pedir nada: quien pulsa un botón de 333 € no puede
       enterarse de lo que ha reservado en el correo de confirmación. */
    ch_a1_kabala: 'Hola. Soy el agente de Iris. Vas a reservar la consulta de Kábala: son tres sesiones, {p} en total. Mi único trabajo es buscarte el primer hueco con ella. ¿Cómo te llamas?',
    /* El precio, dicho en la conversación y no en letra pequeña. Va después de
       elegir hora: quien ya tiene un hueco encima de la mesa lo quiere, y ahí
       el precio es un dato; dicho al principio, es un portazo. */
    ch_precio: 'Antes del último paso, dos cosas. La consulta son {p}.',
    ch_precio_oferta: 'Antes del último paso, dos cosas. La consulta son {o} en vez de {p}: es el precio de aniversario, para las {n} primeras.',
    ch_precio_kabala: 'Antes del último paso, dos cosas. La Kábala son tres sesiones, {p} en total.',
    ch_sum_kabala: 'Consulta de Kábala reservada: {d} a las {h} (hora española), por videollamada.',
    ch_a2: 'Gracias, {n}. Dime tu fecha de nacimiento y te digo tu número ahora mismo.',
    ch_a3: '¿Y qué es lo que se te repite? Elige lo que más se parezca, o escríbelo tú.',
    ch_a4: 'Ya lo tengo. Estos son los días que Iris tiene libres: elige el que te encaje.',
    ch_a5: 'El {n}, perfecto. ¿A qué hora te viene bien?',
    ch_a6: 'Último paso: dime tu correo y te mando la invitación con el enlace.',
    ch_cond: 'Y si te surge algo puedes cambiar el día, avisándome con 24 horas de antelación. Con menos de 24 horas ya no le puedo dar esa hora a nadie, así que se da por dada.',
    ch_cond_pago: 'Antes del último paso, dos cosas. La sesión se paga al reservar: el enlace de pago te llega junto con la invitación y tu hora queda cerrada en cuanto lo hagas. Y si te surge algo, puedes cambiar el día avisándome con 24 horas de antelación; con menos de 24 horas, la hora se da por dada.',
    ch_cal: 'Días libres en la agenda de Iris.',
    ch_p1: 'Tu nombre', ch_p2: 'dd / mm / aaaa', ch_p3: 'O escríbelo con tus palabras…', ch_p6: 'tucorreo@ejemplo.com',
    ch_sum: 'Sesión reservada: {d} a las {h} (hora española), por videollamada.',
    ch_conf: 'Te acabo de enviar la invitación a {e}. Ábrela y se te guarda en el calendario. Iris ya la tiene en el suyo.',
    ch_err: 'Se me ha caído la conexión al enviar la invitación. Escribe a irissoaresoficial@gmail.com con tu día y hora y lo dejamos cerrado.',
    /* Se ha guardado la reserva pero la invitación no ha salido todavía. Ni se
       promete un correo que no ha salido, ni se le dice a alguien que se ha
       caído todo cuando su cita está apuntada: las dos cosas son mentira. */
    ch_apuntado: 'Lo tengo apuntado: {d} a las {h}. La invitación puede tardar un poco en llegarte; si en un rato no la ves, escribe a irissoaresoficial@gmail.com y Iris te la manda.',
    ch_taken: 'Vaya, ese hueco se acaba de ocupar mientras hablábamos. Elige otro día y lo cerramos.',
  },
  pt: {
    n1: 'Como funciona', n2: 'Ver o meu número', n3: 'Cursos', n4: 'Membresia', book: 'Marcar', free: 'Grátis',
    kick: 'Numerologia transgeracional · online desde 2010',
    h1a: 'O que na tua família nunca se contou,', h1b: 'estás a pagá-lo tu.',
    h1p1: 'A tua mãe viveu-o. A tua avó também. E tu juravas que a ti não te ia acontecer.',
    h1p2: 'Podes aguentá-lo mais trinta anos.',
    h1p2b: 'Ou olhar para ele uma vez.',
    hsub: 'Mostro-te de onde vem o que se repete. E como se corta.',
    hcta: 'Marcar a minha consulta', hcta2: 'Ver o meu número, grátis', hbadge: 'Online · ES / PT / EN',
    s1: 'pessoas acompanhadas', s2: 'desde', s3: 'idiomas',
    p_lab: 'A ver se te soa',
    p1: 'Mudas de trabalho e ao fim de seis meses sentes-te igual.',
    p2: 'Mudas de relação e discutem pelo mesmo.',
    p3: 'Ganhas mais e ao fim do mês continua a não sobrar nada.',
    p4: 'Carregas algo que nem sequer te aconteceu a ti.',
    p_punch: 'E passaste anos a jurar que não ias ser assim.',
    b_lab: 'Porque acontece',
    b_h: 'Não é o teu feitio. É uma história que ninguém fechou.',
    b_p1: 'Em toda a família há algo de que não se falou: um amante que nunca se reconheceu, uma doença psiquiátrica, alguém que esteve preso. Ninguém conta, e mesmo assim passa de geração em geração.',
    b_p2: 'Com o teu nome e a tua data vê-se em que geração começou, como chegou até ti e que parte te toca largar.',
    q_h: 'Isto chama-se numerologia transgeracional.',
    q_p1: 'O teu nome e a tua data guardam o que aconteceu na tua família. Em números vê-se o padrão: o que se repete e desde quando.',
    sg_h: 'Com essa pessoa acabam sempre no mesmo.',
    sg_p: 'A tua data e a dela. Nada mais.',
    sg_cta: 'Ver agora',
    cu_h: 'Já sabes que não vai desaparecer sozinho.',
    cu_p: 'Online, com a tua história já preparada antes de nos vermos.',
    cu_num: 'O que é a numerologia transgeracional',
    cu_kab: 'O que é a Kábala',
    cu_num_p: 'De onde vem o que se repete, e o preço.',
    cu_kab_p: 'A árvore, as dez portas e o preço.',
    q_p2: 'Não adivinha o futuro. Olha para trás para entender o que já te está a acontecer. A conta faz-se à tua frente, com números, e podes refazê-la tu.',
    w_lab: 'Quem sou', w_h: 'Sou a Iris. Ajudo-te a libertares-te dos padrões que não te pertencem.', w_h2: 'E a devolvê-los à sua origem.',
    w_hola: 'Olá. Sou a Iris,',
    w_oficio: 'numeróloga transgeracional.',
    w_que: 'Eu não o interpreto. Conto-o com números: o teu nome, a tua data e as da tua linha. E isto tem nome.',
    w_p1: 'Passei anos a observar padrões no mundo corporativo e a decifrar o que acontece quando ninguém olha.',
    w_p2: 'Em 2010 uni o melhor da numerologia, da psicossomática clínica, das constelações e das terapias integrativas para criar um método prático e profundo. O objetivo da minha consulta é só um: que saias a saber quem és e que decisão tomar hoje.',
    w1: 'Direito', w2: 'Psicologia', w3: 'Psicossomática', w4: 'Descodificação', w5: 'Numerologia', w6: 'Transgeracional',
    m_lab: 'Como funciona', m_h: 'Três passos. Sem mistério.',
    m1t: 'Dás-me dois dados', m1p: 'O teu nome e a tua data. As da tua família, se souberes.',
    m2t: 'Preparo a tua história', m2p: 'Desenho o que se repete na tua linha antes da sessão.',
    m3t: 'Vemo-nos em direto', m3p: 'Vês no ecrã. Sais com exercícios, relatório e gravação.',
    wl_lab: 'A comunidade · em breve',
    wl_h: 'Perceber leva uma sessão. Mudar leva meses.',
    wl_p: 'Um grupo pequeno. Todos os meses, uma parte da tua história familiar.',
    wl_cta: 'Avisem-me quando abrir',
    wl_err: 'Esse email não parece válido.', wl_done_h: 'Lugar guardado.',
    wl_more: 'Ver o que inclui e como funciona →',
    wl_sending: 'A guardar…', wl_fail: 'Não consegui guardar agora. Tenta daqui a um minuto ou escreve para irissoaresoficial@gmail.com.',
    wl_done_p: 'Escrevo-te assim que abrirmos, e serás das primeiras a saber o que há lá dentro.',
    e_lab: 'Cursos e workshops', e_h: 'E de vez em quando, uns dias em direto.',
    e_sub: 'Um tema concreto, com o teu caso em cima da mesa.',
    e_c2: 'Preço de lançamento', e_cta: 'Ver os cursos',
    f_lab: 'Dúvidas', f_h: 'O que me perguntam sempre.',
    f_q1: 'O que levo da sessão?', f_a1: 'A tua história em números e explicada à tua frente, e o que se repete assinalado com nome e data. Sais a saber de onde vem, não com uma lista de conselhos.',
    f_q2: 'Tenho de acreditar em algo?', f_a2: 'Não. Aqui não há religião, nem grupo, nem nada a que aderir. A conta faz-se à tua frente e podes refazê-la tu.',
    f_q3: 'Substitui um psicólogo?', f_a3: 'Não, e não pretende. Se estás em terapia, continua. Isto acompanha e não interfere.',
    f_q4: 'O que fazem com os meus dados?', f_a4: 'Só servem para preparar a tua sessão. Não se partilham nem se vendem, e apago-os se pedires.',
    f_q5: 'Isto é adivinhar o futuro?', f_a5: 'Não. A numerologia transgeracional olha para trás, não para a frente: de onde vem o que te acontece.',
    f_q6: 'E se não souber as datas dos meus avós?', f_a6: 'Trabalha-se com o que houver. Só com a tua data já sai muito, e muitas vezes é o próprio estudo que empurra a perguntar em casa.',
    f_q7: 'Como se calcula o meu número?', f_a7: 'Reduzem-se em separado o dia, o mês e o ano do teu nascimento, e depois somam-se. O 11, o 22 e o 33 não se reduzem: são mestres. Podes experimentar aqui mesmo.',
    f_q8: 'As sessões são online?', f_a8: 'Online, por videochamada, para atender de Portugal, Espanha ou América sem ninguém apanhar um comboio.',
    f_q9: 'Em que idiomas?', f_a9: 'Português, espanhol e inglês.',
    f_q10: 'É preciso preparar alguma coisa?', f_a10: 'A tua data de nascimento e o teu nome completo de nascimento. Se tiveres as datas dos pais e avós, melhor ainda.',
    f_q11: 'E se precisar de mudar a marcação?', f_a11: 'Muda-se, e sem custo: escreve para irissoaresoficial@gmail.com e procura-se outro horário. Só uma coisa, avisa com 24 horas — com menos, essa hora já não a posso dar a ninguém e conta como dada.',
    f_q12: 'Posso oferecer uma sessão?', f_a12: 'Sim. Escreve-me e tratamos disso: a pessoa escolhe o dia que lhe der jeito.',
    c_h: 'O que tu não olhares, olha-o quem vier a seguir.', c_p: 'Comecemos pela tua data.',
    c_btn: 'Marcar a minha consulta', c_micro: 'Marca-se a conversar · um minuto',
    ft_p: 'Iris Soares. Perceber de onde vem o que se repete, e deixar de o repetir.',
    ft_start: 'Começar', ft_1: 'Sessão com a Iris', ft_2: 'Testar grátis', ft_3: 'Cursos e workshops', ft_4: 'A membresia',
    ft_legal: 'Legal', ft_l1: 'Aviso legal', ft_l2: 'Privacidade', ft_l3: 'Contacto',
    ft_disc: 'As sessões e os cursos não são um tratamento médico nem psicológico e não substituem nenhum.',
    cbook: 'Marcar', clook: 'Ver', csee: 'Ver', cgo: 'Entrar',
    ch_title: 'Agente da Iris', ch_sub: 'Agente de IA · agenda em direto', ch_done: 'Sessão marcada',
    ch_priv: 'Sou um agente de IA, não a Iris. Os teus dados só servem para preparar a sessão e para a marcação.',
    ch_a1: 'Olá. Sou o agente da Iris e a minha única função é arranjar-te um horário com ela. Como te chamas?',
    ch_a1_kabala: 'Olá. Sou o agente da Iris. Vais marcar a consulta de Cabala: são três sessões, {p} no total. A minha única função é arranjar-te o primeiro horário com ela. Como te chamas?',
    ch_precio: 'Antes do último passo, duas coisas. A consulta são {p}.',
    ch_precio_oferta: 'Antes do último passo, duas coisas. A consulta são {o} em vez de {p}: é o preço de aniversário, para as {n} primeiras.',
    ch_precio_kabala: 'Antes do último passo, duas coisas. A Cabala são três sessões, {p} no total.',
    ch_sum_kabala: 'Consulta de Cabala marcada: {d} às {h} (hora de Espanha), por videochamada.',
    ch_a2: 'Obrigada, {n}. Diz-me a tua data de nascimento e digo-te já o teu número.',
    ch_a3: 'E o que é que se repete contigo? Escolhe o que mais se parecer, ou escreve-o tu.',
    ch_a4: 'Já tenho. Estes são os dias livres da Iris: escolhe o que te der jeito.',
    ch_a5: 'Dia {n}, perfeito. A que horas te dá jeito?',
    ch_a6: 'Último passo: diz-me o teu email e envio-te o convite com o link.',
    ch_cond: 'E se te surgir alguma coisa podes mudar o dia, avisando-me com 24 horas de antecedência. Com menos de 24 horas já não posso dar essa hora a ninguém, por isso conta como dada.',
    ch_cond_pago: 'Antes do último passo, duas coisas. A sessão paga-se ao marcar: o link de pagamento chega-te junto com o convite e a tua hora fica fechada assim que o fizeres. E se te surgir alguma coisa, podes mudar o dia avisando-me com 24 horas de antecedência; com menos de 24 horas, a hora conta como dada.',
    ch_cal: 'Dias livres na agenda da Iris.',
    ch_p1: 'O teu nome', ch_p2: 'dd / mm / aaaa', ch_p3: 'Ou escreve-o com as tuas palavras…', ch_p6: 'teuemail@exemplo.com',
    ch_sum: 'Sessão marcada: {d} às {h} (hora de Espanha), por videochamada.',
    ch_conf: 'Acabei de enviar o convite para {e}. Abre-o e fica guardado no teu calendário. A Iris já o tem no dela.',
    ch_err: 'Caiu-me a ligação ao enviar o convite. Escreve para irissoaresoficial@gmail.com com o teu dia e hora e fica tratado.',
    ch_apuntado: 'Já está apontado: {d} às {h}. O convite pode demorar um pouco a chegar; se daqui a um bocado não o vires, escreve para irissoaresoficial@gmail.com e a Iris envia-to.',
    ch_taken: 'Esse horário acabou de ficar ocupado enquanto falávamos. Escolhe outro dia e fechamos.',
  },
  en: {
    n1: 'How it works', n2: 'See my number', n3: 'Courses', n4: 'Membership', book: 'Book', free: 'Free',
    kick: 'Transgenerational numerology · online since 2010',
    h1a: 'What your family never spoke about,', h1b: 'you are the one paying for.',
    h1p1: 'Your mother lived it. Your grandmother too. And you swore it would not happen to you.',
    h1p2: 'You can carry it another thirty years.',
    h1p2b: 'Or look at it once.',
    hsub: 'I show you where the repetition comes from. And how to cut it.',
    hcta: 'Book my session', hcta2: 'See my number, free', hbadge: 'Online · ES / PT / EN',
    s1: 'people seen', s2: 'since', s3: 'languages',
    p_lab: 'See if this sounds familiar',
    p1: 'You change jobs and six months later you feel exactly the same.',
    p2: 'You change partners and you argue about the same thing.',
    p3: 'You earn more and there is still nothing left at the end of the month.',
    p4: 'You carry something that never even happened to you.',
    p_punch: 'And you spent years swearing you would never be like this.',
    b_lab: 'Why it happens',
    b_h: 'It is not your character. It is a story nobody closed.',
    b_p1: 'Every family has something nobody talked about: a lover who was never acknowledged, a psychiatric illness, someone who was in prison. No one tells it, and it gets passed down all the same.',
    b_p2: 'With your name and your date you can see which generation it started in, how it reached you, and what is yours to put down.',
    q_h: 'This is called transgenerational numerology.',
    q_p1: 'Your name and your date hold what happened in your family. In numbers the pattern shows: what repeats, and since when.',
    sg_h: 'With that person it always ends the same way.',
    sg_p: 'Your date and theirs. Nothing else.',
    sg_cta: 'See it now',
    cu_h: 'You already know it will not go away on its own.',
    cu_p: 'Online, with your story prepared before we meet.',
    cu_num: 'What transgenerational numerology is',
    cu_kab: 'What Kabbalah is',
    cu_num_p: 'Where the repetition comes from, and the price.',
    cu_kab_p: 'The tree, the ten gates and the price.',
    q_p2: 'It does not predict the future. It explains the present.',
    w_lab: 'Who I am', w_h: 'I am Iris. I help you free yourself from patterns that are not yours.', w_h2: 'And return them to where they came from.',
    w_hola: 'Hello. I am Iris,',
    w_oficio: 'a transgenerational numerologist.',
    w_que: 'I do not interpret it. I work it out with numbers: your name, your date and your line\u2019s. And it has a name.',
    w_p1: 'I spent years observing patterns in the corporate world and working out what happens when nobody is looking.',
    w_p2: 'In 2010 I brought together the best of numerology, clinical psychosomatics, constellations and integrative therapies to build a method that is practical and deep. My consultation has one single aim: that you leave knowing who you are and what to decide today.',
    w1: 'Law', w2: 'Psychology', w3: 'Psychosomatics', w4: 'Decoding', w5: 'Numerology', w6: 'Transgenerational',
    m_lab: 'How it works', m_h: 'Three steps. No mystery.',
    m1t: 'You give me two things', m1p: 'Your name and your date. Your family’s, if you know them.',
    m2t: 'I prepare your story', m2p: 'I map out what repeats in your line before we meet.',
    m3t: 'We meet live', m3p: 'You see it on screen. You leave with exercises, a report and the recording.',
    wl_lab: 'The community · coming soon',
    wl_h: 'Understanding it takes one session. Changing it takes months.',
    wl_p: 'A small group. Every month, one part of your family story.',
    wl_cta: 'Let me know when it opens',
    wl_err: 'That email does not look valid.', wl_done_h: 'Spot saved.',
    wl_more: 'See what it includes and how it works →',
    wl_sending: 'Saving…', wl_fail: 'I could not save it just now. Try again in a minute or email irissoaresoficial@gmail.com.',
    wl_done_p: 'I will write as soon as we open, and you will be among the first to know what is inside.',
    e_lab: 'Courses and workshops', e_h: 'And every now and then, a few live days.',
    e_sub: 'One specific theme, with your own case on the table.',
    e_c2: 'Launch price', e_cta: 'See the courses',
    f_lab: 'Questions', f_h: 'What people always ask me.',
    f_q1: 'What do I get out of the session?', f_a1: 'Your story put into numbers and explained in front of you, with what repeats pointed out by name and date. You leave knowing where it comes from, not with a list of tips.',
    f_q2: 'Do I have to believe in anything?', f_a2: 'No. There is no religion here, no group, nothing to sign up to. The calculation is done in front of you and you can redo it yourself.',
    f_q3: 'Does it replace a therapist?', f_a3: 'No, and it does not try to. If you are in therapy, stay in it. This goes alongside and does not interfere.',
    f_q4: 'What do you do with my data?', f_a4: 'It is only used to prepare your session. It is never shared or sold, and I delete it if you ask.',
    f_q5: 'Is this fortune telling?', f_a5: 'No. Transgenerational numerology looks backwards, not forwards: where what happens to you comes from. Nobody is going to tell you who you will marry.',
    f_q6: 'What if I do not know my grandparents dates?', f_a6: 'We work with whatever there is. Your own date alone already shows a lot, and often the study itself is what pushes you to ask at home.',
    f_q7: 'How is my number calculated?', f_a7: 'The day, the month and the year of your birth are reduced separately, and then added. 11, 22 and 33 are not reduced: they are master numbers. You can try it right here, without leaving any data.',
    f_q8: 'Are the sessions online?', f_a8: 'Online, by video call, so it works the same from Spain, Portugal or the Americas.',
    f_q9: 'Which languages?', f_a9: 'Spanish, Portuguese and English.',
    f_q10: 'Do I need to prepare anything?', f_a10: 'Your date of birth and your full name at birth. If you have your parents and grandparents dates to hand, even better: that is where the repetitions show up.',
    f_q11: 'What if I need to move the appointment?', f_a11: 'It gets moved, at no cost: write to irissoaresoficial@gmail.com and we find another slot. One thing: give me 24 hours — with less than that I can no longer offer the slot to anyone, so it counts as taken.',
    f_q12: 'Can I gift a session?', f_a12: 'Yes. Write to me and we will set it up: the person picks the day that suits them.',
    c_h: 'What you do not look at, the next one will.', c_p: 'Let us start with your date.',
    c_btn: 'Book my session', c_micro: 'Booked by chatting · one minute',
    ft_p: 'Iris Soares. Understanding where the repetition comes from, and stopping it.',
    ft_start: 'Start', ft_1: 'Session with Iris', ft_2: 'Try it free', ft_3: 'Courses and workshops', ft_4: 'The membership',
    ft_legal: 'Legal', ft_l1: 'Legal notice', ft_l2: 'Privacy', ft_l3: 'Contact',
    ft_disc: 'These sessions and courses are not a medical or psychological treatment and do not replace one.',
    cbook: 'Book', clook: 'Look', csee: 'See', cgo: 'Enter',
    ch_title: 'Iris’s AI agent', ch_sub: 'AI agent · live calendar', ch_done: 'Session booked',
    ch_priv: 'I am an AI agent, not Iris. Your details are only used to prepare your session and the booking.',
    ch_a1: 'Hi. I am Iris’s agent and my only job is to find you a slot with her. What is your name?',
    ch_a1_kabala: "Hi. I'm Iris's agent. You're booking the Kabbalah reading: it's three sessions, {p} in total. My only job is to find you the first slot with her. What's your name?",
    ch_precio: 'Before the last step, two things. The session is {p}.',
    ch_precio_oferta: 'Before the last step, two things. The session is {o} instead of {p}: it is the anniversary price, for the first {n}.',
    ch_precio_kabala: 'Before the last step, two things. The Kabbalah reading is three sessions, {p} in total.',
    ch_sum_kabala: 'Kabbalah session booked: {d} at {h} (Spanish time), by video call.',
    ch_a2: 'Thank you, {n}. Give me your date of birth and I will tell you your number right now.',
    ch_a3: 'And what is it that keeps repeating? Pick whichever comes closest, or write your own.',
    ch_a4: 'Got it. These are the days Iris has free — pick the one that works for you.',
    ch_a5: '{n} it is. What time suits you?',
    ch_a6: 'Last step: give me your email and I will send the invite with the link.',
    ch_cond: 'Before the last step, one thing: if something comes up you can move the day, as long as you tell me 24 hours in advance. With less than 24 hours I can no longer give that slot to anyone, so it counts as taken.',
    ch_cond_pago: 'Before the last step, two things. The session is paid when you book: the payment link comes with the invite, and your slot is confirmed as soon as you pay. And if something comes up, you can move the day by telling me 24 hours in advance; with less than 24 hours, the slot counts as taken.',
    ch_cal: 'Free days in Iris’s calendar.',
    ch_p1: 'Your name', ch_p2: 'dd / mm / yyyy', ch_p3: 'Or say it in your own words…', ch_p6: 'you@example.com',
    ch_sum: 'Session booked: {d} at {h} (Spanish time), over video call.',
    ch_conf: 'I have just sent the invite to {e}. Open it and it saves to your calendar. Iris already has it in hers.',
    ch_err: 'My connection dropped while sending the invite. Email irissoaresoficial@gmail.com with your day and time and we will get it confirmed.',
    ch_apuntado: 'You are down for {d} at {h}. The invite may take a little while to arrive; if you do not see it soon, email irissoaresoficial@gmail.com and Iris will send it over.',
    ch_taken: 'That slot just got taken while we were talking. Pick another day and we will lock it in.',
  },
} as const;

export type CopyDict = { [K in keyof typeof COPY.es]: string };

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: CopyDict }>({
  lang: 'es',
  setLang: () => {},
  t: COPY.es,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es');

  useEffect(() => {
    try {
      const l = localStorage.getItem('iris-lang') as Lang | null;
      if (l && COPY[l]) setLangState(l);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('iris-lang', l);
    } catch {}
  };

  return <LangContext.Provider value={{ lang, setLang, t: COPY[lang] }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
