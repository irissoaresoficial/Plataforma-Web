"use client";
import { css } from "@/lib/css";
import type { Bloque } from "@/lib/estudio";
import type { Resultado } from "@/lib/engine";
import { DocArbol, DocEstructura, DocAlma, DocCuentas, DocCiclos } from "./DocDiagramas";
import styles from "./Estudio.module.css";

export default function BloqueView({
  b,
  r,
  txt,
  guardaEdit,
}: {
  b: Bloque;
  /** El estudio de empresa no trae ninguno de los bloques con dibujo —salen
   *  todos de la fecha— así que va sin `r`. */
  r?: Resultado | null;
  txt: (id: string, def: string) => string;
  guardaEdit: (id: string, texto: string) => void;
}) {
  const onBlur = (id: string) => (e: React.FocusEvent<HTMLParagraphElement>) => guardaEdit(id, (e.target.textContent || "").trim());

  // Todo párrafo del documento se puede reescribir, pero no había forma de
  // saberlo: parecía texto impreso. Ahora se marcan como editables — al pasar
  // el ratón se tiñen y sale el cursor de texto, y al entrar se enmarcan.
  const editable = {
    contentEditable: true,
    suppressContentEditableWarning: true,
    "data-editable": "",
    title: "Pulsa para reescribirlo con tus palabras",
  } as const;

  switch (b.tipo) {
    case "h":
      return <div style={css("font-family:'Cinzel',serif;font-size:var(--t-mini);letter-spacing:.2em;text-transform:uppercase;color:#9A7F32;border-top:1px solid rgba(201,168,76,.3);padding-top:9px;")}>{b.texto}</div>;
    case "lead":
      return (
        <p
          {...editable}
          onBlur={onBlur(b.editId)}
          style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-size:var(--t-title);line-height:1.5;color:#5E5670;margin:0;text-wrap:pretty;")}
        >
          {txt(b.editId, b.textoDef)}
        </p>
      );
    case "p":
      return (
        <p
          {...editable}
          onBlur={onBlur(b.editId)}
          style={css("font-family:'Cormorant Garamond',serif;font-size:var(--t-read);line-height:1.56;color:#37323F;margin:0;text-align:justify;text-wrap:pretty;white-space:pre-line;")}
        >
          {txt(b.editId, b.textoDef)}
        </p>
      );
    case "dato":
      return (
        <div style={css("display:flex;gap:16px;align-items:flex-start;border-left:2px solid #C9A84C;padding-left:14px;")}>
          <div style={css("min-width:78px;")}>
            <div style={css("font-family:'Karla',sans-serif;font-size:var(--t-micro);letter-spacing:.22em;text-transform:uppercase;color:#9B93A8;")}>{b.label}</div>
            <div style={css("font-family:'Cinzel',serif;font-size:var(--t-hero);line-height:1.1;color:#241F2E;")}>{b.valor}</div>
          </div>
          <p {...editable} onBlur={onBlur(b.editId)} style={css("font-family:'Cormorant Garamond',serif;font-size:var(--t-read);line-height:1.55;color:#37323F;margin:0;flex:1;text-wrap:pretty;")}>
            {txt(b.editId, b.textoDef)}
          </p>
        </div>
      );
    case "polos":
      return (
        <div className={styles.duo}>
          <div style={css("border-left:2px solid #C0574C;padding-left:12px;")}>
            <div style={css("font-family:'Karla',sans-serif;font-size:var(--t-micro);letter-spacing:.2em;text-transform:uppercase;color:#B0564C;margin-bottom:3px;")}>En negativo</div>
            <p {...editable} onBlur={onBlur(b.editIdNeg)} style={css("font-family:'Cormorant Garamond',serif;font-size:var(--t-body);line-height:1.5;color:#413B4B;margin:0;")}>
              {txt(b.editIdNeg, b.negDef)}
            </p>
          </div>
          <div style={css("border-left:2px solid #4C8A5A;padding-left:12px;")}>
            <div style={css("font-family:'Karla',sans-serif;font-size:var(--t-micro);letter-spacing:.2em;text-transform:uppercase;color:#40794F;margin-bottom:3px;")}>En positivo</div>
            <p {...editable} onBlur={onBlur(b.editIdPos)} style={css("font-family:'Cormorant Garamond',serif;font-size:var(--t-body);line-height:1.5;color:#413B4B;margin:0;")}>
              {txt(b.editIdPos, b.posDef)}
            </p>
          </div>
        </div>
      );
    case "refs":
      return (
        <div style={css("display:flex;flex-direction:column;gap:8px;")}>
          {b.items.map((i, ii) => (
            <div key={ii} style={css(i.style)}>
              <div style={css("font-family:'Karla',sans-serif;font-size:var(--t-micro);letter-spacing:.2em;text-transform:uppercase;color:" + i.color + ";margin-bottom:3px;")}>{i.label}</div>
              <p style={css("font-family:'Cormorant Garamond',serif;font-size:var(--t-body);line-height:1.5;color:#413B4B;margin:0;")}>{i.texto}</p>
            </div>
          ))}
        </div>
      );
    case "arbol":
      return r ? <div data-nocorte=""><DocArbol r={r} /></div> : null;
    case "estructura":
      return r ? <div data-nocorte=""><DocEstructura r={r} /></div> : null;
    case "alma":
      return r ? <div data-nocorte=""><DocAlma r={r} /></div> : null;
    case "cuentas":
      return r ? <div data-nocorte=""><DocCuentas r={r} /></div> : null;
    case "ciclos":
      return r ? <div data-nocorte=""><DocCiclos r={r} /></div> : null;
    case "cifras":
      return (
        <div style={css("display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 26px;")}>
          {b.filas.map((f, fi) => (
            <div
              key={fi}
              style={css(
                "display:flex;align-items:baseline;gap:12px;padding:9px 0;" + (fi > 1 ? "border-top:1px solid rgba(201,168,76,.22);" : "")
              )}
            >
              <span style={css("font-family:'Karla',sans-serif;font-size:var(--t-micro);letter-spacing:.18em;text-transform:uppercase;color:#9B93A8;min-width:96px;")}>{f.label}</span>
              <span style={css("font-family:'Cinzel',serif;font-size:var(--t-title);line-height:1;color:#241F2E;")}>{f.valor}</span>
              <span style={css("font-family:'Cormorant Garamond',serif;font-size:var(--t-body);line-height:1.35;color:#6B6478;margin-left:auto;text-align:right;")}>{f.pie}</span>
            </div>
          ))}
        </div>
      );
    case "cita":
      return (
        <p
          data-nocorte=""
          style={css(
            "font-family:'Cormorant Garamond',serif;font-style:italic;font-size:var(--t-title);line-height:1.5;color:#6B6478;text-align:center;border-top:1px solid rgba(201,168,76,.3);border-bottom:1px solid rgba(201,168,76,.3);padding:16px 30px;margin:0;"
          )}
        >
          {b.texto}
        </p>
      );
    default:
      return null;
  }
}
