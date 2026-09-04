'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'es' | 'pt' | 'en';

export const COPY = {
  es: {
    n1: 'Método', n2: 'Sinergia gratis', n3: 'Escuela', n4: 'Cursos', book: 'Reservar', free: 'Gratis',
    kick: 'Gestión emocional · desde 2010',
    h1a: 'Descodifica tu árbol genealógico a través de la', h1b: 'Numerología Transgeneracional.',
    hsub: 'Comprende los patrones heredados y sana tu historia personal con Iris.',
    hcta: 'Reservar sesión', hcta2: 'Ver la membresía', hbadge: 'Online · ES / PT / EN',
    s1: 'personas', s2: 'consulta propia', s3: 'idiomas',
    p_lab: 'Te suena', p1: 'Dices una frase de tu madre.', p2: 'Te enamoras del mismo patrón.', p3: 'Ganas más y acabas igual.', p4: 'Cargas algo que no te pasó.',
    p_punch: 'Y llevas años jurando que tú no ibas a ser así.',
    w_lab: 'Quién soy', w_h: 'Soy Iris. Llegué aquí observando.',
    w_p1: 'Tras años en varias multinacionales observando el comportamiento humano, vi que todos necesitamos sentirnos bien tratados, reconocidos y bien queridos.',
    w_p2: 'Estudié derecho, psicología, psicosomática, descodificación, numerología y transgeneracional, y con todo ello creé el método IRIS. En 2010 abrí mi consulta. Más de 2.200 personas después, sigo en lo mismo: que cada uno se responsabilice de su vida.',
    w1: 'Derecho', w2: 'Psicología', w3: 'Psicosomática', w4: 'Descodificación', w5: 'Numerología', w6: 'Transgeneracional',
    m_lab: 'Método IRIS', m_h: 'Tres pasos. Ningún misterio.',
    m1t: 'Datos', m1p: 'Tu nombre, tu fecha y las de tu familia. Las que falten, faltan.',
    m2t: 'Mapa', m2p: 'Preparo tu mapa y el de tu línea antes de vernos. Llego con el trabajo hecho.',
    m3t: '90 minutos', m3p: 'Te lo enseño en pantalla. Sales con ejercicios, informe y grabación.',
    wl_lab: 'Membresía · lista de espera', wl_h: 'Acompañamiento mensual de Numerología Transgeneracional.',
    wl_p: 'Un espacio exclusivo donde, mes a mes, descifamos la influencia de tus ancestros y liberamos bloqueos conscientes e inconscientes.',
    wl_urgent: 'Oferta de lanzamiento: las primeras 10 personas en la lista de espera acceden con un precio especial vitalicio.',
    wl_ph_mail: 'tucorreo@ejemplo.com', wl_cta: 'Quiero mi lugar en la lista de espera',
    wl_priv: 'Un aviso cuando abra y nada más. Sin listas raras.',
    wl_err: 'Ese correo no parece válido.', wl_done_h: 'Ya tienes tu sitio.',
    wl_done_p: 'Te escribimos en cuanto abramos la membresía con tu precio especial vitalicio.',
    e_lab: 'La Escuela', e_h: 'Aprende a leerlo tú.',
    e_sub: 'La formación del método IRIS abre con diez plazas. Programa, ponentes y metodología dentro.',
    e_c1: '10 plazas', e_c2: 'Precio de lanzamiento', e_cta: 'Ver la formación',
    f_lab: 'Dudas', f_h: 'Cuatro cosas que me preguntan siempre.',
    f_q1: '¿Necesito datos de mi familia?', f_a1: 'Ayudan, pero no hacen falta. Con los tuyos ya sale mucho.',
    f_q2: '¿Tengo que creer en algo?', f_a2: 'No. No hay creencia que aceptar ni grupo al que pertenecer.',
    f_q3: '¿Sustituye a la terapia?', f_a3: 'No. Si estás en tratamiento, sigue con él. Esto acompaña.',
    f_q4: '¿Qué hacéis con mis datos?', f_a4: 'Solo se usan para tu estudio. No se comparten con nadie.',
    c_h: 'Vamos a mirarlo juntos.', c_p: 'Online, noventa minutos, con tu mapa preparado antes de vernos.',
    c_btn: 'Reservar mi sesión', c_micro: 'Se reserva hablando · 1 minuto',
    ft_p: 'Iris Soares Gestión Emocional. Autoconocimiento, responsabilidad y acción positiva.',
    ft_start: 'Empezar', ft_1: 'Sesión individual', ft_2: 'Sinergia gratis', ft_3: 'La Escuela', ft_4: 'Próximos cursos',
    ft_legal: 'Legal', ft_l1: 'Aviso legal', ft_l2: 'Privacidad', ft_l3: 'Contacto',
    ft_disc: 'Los estudios de gestión emocional y numerología transgeneracional no son un tratamiento médico ni psicológico y no sustituyen a ninguno.',
    cbook: 'Reservar', clook: 'Mirar', csee: 'Ver', cgo: 'Entrar',
    ch_title: 'Agente de Iris', ch_sub: 'Agente de IA · agenda en directo', ch_done: 'Consulta reservada',
    ch_priv: 'Soy un agente de IA, no Iris. Tus datos solo se usan para tu estudio y para la cita.',
    ch_a1: 'Hola. Soy un agente de inteligencia artificial y trabajo para Iris: mi único trabajo es reservarte una consulta con ella. ¿Cómo te llamas?',
    ch_a2: 'Gracias, {n}. ¿Cuál es tu fecha de nacimiento? Iris la necesita para preparar tu mapa antes de veros.',
    ch_a3: 'Y en una línea: ¿qué es eso que se te repite?',
    ch_a4: 'Ya lo tengo. Este es el calendario de Iris: elige el día que te encaje.',
    ch_a5: 'El {n}, perfecto. ¿A qué hora? Cada consulta dura noventa minutos.',
    ch_a6: 'Último paso: dime tu correo y te mando la invitación con el enlace.',
    ch_cal: 'Días con hueco en la agenda de Iris. Se sincroniza con su Google Calendar.',
    ch_p1: 'Tu nombre', ch_p2: 'dd / mm / aaaa', ch_p3: 'Lo que se me repite es…', ch_p6: 'tucorreo@ejemplo.com',
    ch_sum: 'Consulta reservada: {d} a las {h} (CET), noventa minutos por videollamada.',
    ch_conf: 'Te acabo de enviar la invitación a {e}. Queda en la agenda de Iris y te llegará el recordatorio el día antes.',
  },
  pt: {
    n1: 'Método', n2: 'Sinergia grátis', n3: 'Escola', n4: 'Cursos', book: 'Marcar', free: 'Grátis',
    kick: 'Gestão emocional · desde 2010',
    h1a: 'Descodifica a tua árvore genealógica através da', h1b: 'Numerologia Transgeracional.',
    hsub: 'Compreende os padrões herdados e cura a tua história pessoal com a Iris.',
    hcta: 'Marcar sessão', hcta2: 'Ver a membresia', hbadge: 'Online · ES / PT / EN',
    s1: 'pessoas', s2: 'consulta própria', s3: 'idiomas',
    p_lab: 'Soa-te', p1: 'Dizes uma frase da tua mãe.', p2: 'Apaixonas-te pelo mesmo padrão.', p3: 'Ganhas mais e acabas igual.', p4: 'Carregas algo que não te aconteceu.',
    p_punch: 'E passaste anos a jurar que não ias ser assim.',
    w_lab: 'Quem sou', w_h: 'Sou a Iris. Cheguei aqui a observar.',
    w_p1: 'Depois de anos em várias multinacionais a observar o comportamento humano, vi que todos precisamos de nos sentir bem tratados, reconhecidos e bem amados.',
    w_p2: 'Estudei direito, psicologia, psicossomática, descodificação, numerologia e transgeracional, e com tudo isso criei o método IRIS. Em 2010 abri a minha consulta. Mais de 2.200 pessoas depois, continuo no mesmo: que cada um se responsabilize pela sua vida.',
    w1: 'Direito', w2: 'Psicologia', w3: 'Psicossomática', w4: 'Descodificação', w5: 'Numerologia', w6: 'Transgeracional',
    m_lab: 'Método IRIS', m_h: 'Três passos. Nenhum mistério.',
    m1t: 'Dados', m1p: 'O teu nome, a tua data e as da tua família. As que faltarem, faltam.',
    m2t: 'Mapa', m2p: 'Preparo o teu mapa e o da tua linha antes da sessão. Chego com o trabalho feito.',
    m3t: '90 minutos', m3p: 'Mostro-te no ecrã. Sais com exercícios, relatório e gravação.',
    wl_lab: 'Membresia · lista de espera', wl_h: 'Acompanhamento mensal de Numerologia Transgeracional.',
    wl_p: 'Um espaço exclusivo onde, mês a mês, decifamos a influência dos teus ancestrais e libertamos bloqueios conscientes e inconscientes.',
    wl_urgent: 'Oferta de lançamento: as primeiras 10 pessoas na lista de espera entram com um preço especial vitalício.',
    wl_ph_mail: 'teuemail@exemplo.com', wl_cta: 'Quero o meu lugar na lista de espera',
    wl_priv: 'Um aviso quando abrir e mais nada. Sem listas estranhas.',
    wl_err: 'Esse email não parece válido.', wl_done_h: 'Já tens o teu lugar.',
    wl_done_p: 'Escrevemos-te assim que abrirmos a membresia com o teu preço especial vitalício.',
    e_lab: 'A Escola', e_h: 'Aprende a lê-lo tu.',
    e_sub: 'A formação do método IRIS abre com dez vagas. Programa, oradores e metodologia lá dentro.',
    e_c1: '10 vagas', e_c2: 'Preço de lançamento', e_cta: 'Ver a formação',
    f_lab: 'Dúvidas', f_h: 'Quatro coisas que me perguntam sempre.',
    f_q1: 'Preciso dos dados da família?', f_a1: 'Ajudam, mas não são precisos. Com os teus já sai muito.',
    f_q2: 'Tenho de acreditar em algo?', f_a2: 'Não. Não há crença a aceitar nem grupo a que pertencer.',
    f_q3: 'Substitui a terapia?', f_a3: 'Não. Se estás em tratamento, continua. Isto acompanha.',
    f_q4: 'O que fazem com os meus dados?', f_a4: 'Só são usados para o teu estudo. Não se partilham.',
    c_h: 'Vamos olhar para isto juntos.', c_p: 'Online, noventa minutos, com o teu mapa preparado antes.',
    c_btn: 'Marcar a minha sessão', c_micro: 'Marca-se a conversar · 1 minuto',
    ft_p: 'Iris Soares Gestão Emocional. Autoconhecimento, responsabilidade e ação positiva.',
    ft_start: 'Começar', ft_1: 'Sessão individual', ft_2: 'Sinergia grátis', ft_3: 'A Escola', ft_4: 'Próximos cursos',
    ft_legal: 'Legal', ft_l1: 'Aviso legal', ft_l2: 'Privacidade', ft_l3: 'Contacto',
    ft_disc: 'Os estudos de gestão emocional e numerologia transgeracional não são um tratamento médico nem psicológico e não substituem nenhum.',
    cbook: 'Marcar', clook: 'Ver', csee: 'Ver', cgo: 'Entrar',
    ch_title: 'Agente da Iris', ch_sub: 'Agente de IA · agenda em direto', ch_done: 'Consulta marcada',
    ch_priv: 'Sou um agente de IA, não a Iris. Os teus dados só servem para o estudo e para a sessão.',
    ch_a1: 'Olá. Sou um agente de inteligência artificial e trabalho para a Iris: a minha única função é marcar-te uma consulta com ela. Como te chamas?',
    ch_a2: 'Obrigada, {n}. Qual é a tua data de nascimento? A Iris precisa dela para preparar o teu mapa.',
    ch_a3: 'E numa linha: o que é que se repete contigo?',
    ch_a4: 'Já tenho. Este é o calendário da Iris: escolhe o dia que te der jeito.',
    ch_a5: 'Dia {n}, perfeito. A que horas? Cada consulta dura noventa minutos.',
    ch_a6: 'Último passo: diz-me o teu email e envio-te o convite com o link.',
    ch_cal: 'Dias com espaço na agenda da Iris. Sincroniza com o Google Calendar dela.',
    ch_p1: 'O teu nome', ch_p2: 'dd / mm / aaaa', ch_p3: 'O que se repete comigo é…', ch_p6: 'teuemail@exemplo.com',
    ch_sum: 'Consulta marcada: {d} às {h} (CET), noventa minutos por videochamada.',
    ch_conf: 'Acabei de enviar o convite para {e}. Fica na agenda da Iris e recebes o lembrete no dia anterior.',
  },
  en: {
    n1: 'Method', n2: 'Free synergy', n3: 'School', n4: 'Courses', book: 'Book', free: 'Free',
    kick: 'Emotional guidance · since 2010',
    h1a: 'Decode your family tree through', h1b: 'Transgenerational Numerology.',
    hsub: 'Understand the patterns you inherited and heal your own story with Iris.',
    hcta: 'Book a session', hcta2: 'See the membership', hbadge: 'Online · ES / PT / EN',
    s1: 'people', s2: 'own practice', s3: 'languages',
    p_lab: 'Sound familiar', p1: 'You say your mother’s line.', p2: 'You fall for the same pattern.', p3: 'You earn more, end up the same.', p4: 'You carry what never happened to you.',
    p_punch: 'And you spent years swearing you would never be like this.',
    w_lab: 'Who I am', w_h: 'I am Iris. I got here by watching.',
    w_p1: 'After years in several multinationals watching human behaviour, I saw that we all need to feel well treated, recognised and well loved.',
    w_p2: 'I studied law, psychology, psychosomatics, decoding, numerology and transgenerational work, and built the IRIS method out of all of it. I opened my practice in 2010. Over 2,200 people later, the aim is the same: that each person takes charge of their own life.',
    w1: 'Law', w2: 'Psychology', w3: 'Psychosomatics', w4: 'Decoding', w5: 'Numerology', w6: 'Transgenerational',
    m_lab: 'IRIS method', m_h: 'Three steps. No mystery.',
    m1t: 'Data', m1p: 'Your name, your date and your family’s. Missing ones stay missing.',
    m2t: 'Map', m2p: 'I build your map and your family line before we meet. I arrive with the work done.',
    m3t: '90 minutes', m3p: 'I show you on screen. You leave with exercises, a report and the recording.',
    wl_lab: 'Membership · waitlist', wl_h: 'Monthly Transgenerational Numerology guidance.',
    wl_p: 'An exclusive space where, month after month, we decode your ancestors’ influence and release conscious and unconscious blocks.',
    wl_urgent: 'Launch offer: the first 10 people on the waitlist get a special lifetime price.',
    wl_ph_mail: 'you@example.com', wl_cta: 'I want my spot on the waitlist',
    wl_priv: 'One heads-up when it opens, nothing else. No weird lists.',
    wl_err: 'That email does not look valid.', wl_done_h: 'Your spot is saved.',
    wl_done_p: 'We will write to you as soon as the membership opens with your special lifetime price.',
    e_lab: 'The School', e_h: 'Learn to read it yourself.',
    e_sub: 'The IRIS method training opens with ten seats. Programme, speakers and methodology inside.',
    e_c1: '10 seats', e_c2: 'Launch price', e_cta: 'See the training',
    f_lab: 'Questions', f_h: 'Four things people always ask.',
    f_q1: 'Do I need my family’s data?', f_a1: 'It helps, but is not required. Yours alone say a lot.',
    f_q2: 'Do I have to believe in anything?', f_a2: 'No. No belief to accept, no group to join.',
    f_q3: 'Does it replace therapy?', f_a3: 'No. If you are in treatment, stay in it. This accompanies.',
    f_q4: 'What do you do with my data?', f_a4: 'Only used for your study. Never shared.',
    c_h: 'Let us look at it together.', c_p: 'Online, ninety minutes, with your map ready before we meet.',
    c_btn: 'Book my session', c_micro: 'Booked by chatting · 1 minute',
    ft_p: 'Iris Soares Emotional Guidance. Self-knowledge, responsibility and positive action.',
    ft_start: 'Start', ft_1: 'One-to-one session', ft_2: 'Free synergy', ft_3: 'The School', ft_4: 'Upcoming courses',
    ft_legal: 'Legal', ft_l1: 'Legal notice', ft_l2: 'Privacy', ft_l3: 'Contact',
    ft_disc: 'Emotional guidance and transgenerational numerology studies are not a medical or psychological treatment and do not replace one.',
    cbook: 'Book', clook: 'Look', csee: 'See', cgo: 'Enter',
    ch_title: 'Iris’s AI agent', ch_sub: 'AI agent · live calendar', ch_done: 'Session booked',
    ch_priv: 'I am an AI agent, not Iris. Your data is only used for your study and the session.',
    ch_a1: 'Hi. I am an artificial-intelligence agent working for Iris, and my only job is to book you a session with her. What is your name?',
    ch_a2: 'Thank you, {n}. What is your date of birth? Iris needs it to build your map beforehand.',
    ch_a3: 'And in one line: what is the thing that keeps repeating?',
    ch_a4: 'Got it. Here is Iris’s calendar — pick the day that works for you.',
    ch_a5: '{n} it is. What time? Each session runs ninety minutes.',
    ch_a6: 'Last step: give me your email and I will send the invite with the link.',
    ch_cal: 'Days with room in Iris’s diary. Synced with her Google Calendar.',
    ch_p1: 'Your name', ch_p2: 'dd / mm / yyyy', ch_p3: 'What keeps repeating is…', ch_p6: 'you@example.com',
    ch_sum: 'Session booked: {d} at {h} (CET), ninety minutes over video call.',
    ch_conf: 'I have just sent the invite to {e}. It is on Iris’s calendar and you will get a reminder the day before.',
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
