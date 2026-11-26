import { redirect } from 'next/navigation';

/* Un solo enlace para los dos idiomas: esto lleva al de siempre en portugués. */
export default function Pagina() {
  redirect('/curso-desordenes?lang=pt');
}
