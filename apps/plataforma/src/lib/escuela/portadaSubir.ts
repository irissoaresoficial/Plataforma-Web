/**
 * SUBIR LA PORTADA DE UN CURSO.
 *
 * Mismo camino que la foto de perfil (`foto.ts`): se comprueba, se encoge en
 * el navegador y se sube a Firebase. Una foto de móvil pesa 4 MB y la portada
 * sale en cada tarjeta de la lista: se deja en 1600 px de ancho, en JPEG, y
 * pesa unos 200 KB. No se recorta: la tarjeta ya encuadra con `object-fit`.
 *
 * La carpeta es `portadas/<curso>/`, y sólo pueden escribir ahí Iris o quien
 * monta ese curso (lo dice `storage.rules`).
 *
 * La imagen vieja NO se borra al cambiarla, por lo mismo que los vídeos: el
 * curso no se guarda hasta pulsar Guardar, y borrarla antes haría irreversible
 * un cambio que todavía se puede deshacer.
 *
 * SIN FIREBASE se queda como dato dentro del curso, para poder probar la
 * pantalla en local.
 */
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { almacen } from "@/lib/firebase";

const ANCHO = 1600;
/** Lo que se acepta antes de encoger. Más que esto no es una foto normal. */
const TOPE = 15 * 1024 * 1024;
const TIPOS = ["image/jpeg", "image/png", "image/webp"];

/** Qué le pasa a este archivo, en cristiano. Null si está bien. */
export function revisaPortada(f: File): string | null {
  if (!TIPOS.includes(f.type)) return "Eso no es una foto que se pueda usar. Tiene que ser JPG, PNG o WebP.";
  if (f.size > TOPE) {
    const mb = (f.size / (1024 * 1024)).toFixed(0);
    return `Esa imagen pesa ${mb} MB y el tope son 15 MB. Elige otra o expórtala más pequeña.`;
  }
  return null;
}

async function encoge(f: File): Promise<Blob> {
  const img = await createImageBitmap(f).catch(() => {
    throw new Error("No se ha podido abrir esa imagen. Prueba a guardarla otra vez como JPG.");
  });
  const escala = Math.min(1, ANCHO / img.width);
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(img.width * escala);
  lienzo.height = Math.round(img.height * escala);
  const cx = lienzo.getContext("2d");
  if (!cx) throw new Error("Este navegador no deja preparar la imagen.");
  cx.drawImage(img, 0, 0, lienzo.width, lienzo.height);
  return await new Promise<Blob>((listo, falla) =>
    lienzo.toBlob((b) => (b ? listo(b) : falla(new Error("No se ha podido preparar la imagen."))), "image/jpeg", 0.86)
  );
}

/** Sube la portada y devuelve su dirección. Lanza si falla, con el motivo. */
export async function subePortada(cursoId: string, f: File): Promise<string> {
  const malo = revisaPortada(f);
  if (malo) throw new Error(malo);
  const blob = await encoge(f);

  const a = almacen();
  if (!a) {
    return await new Promise<string>((listo) => {
      const r = new FileReader();
      r.onload = () => listo(String(r.result));
      r.readAsDataURL(blob);
    });
  }

  /* Con la hora en el nombre, para que nadie vea la vieja por la caché. */
  const r = ref(a, `portadas/${cursoId}/${Date.now()}.jpg`);
  try {
    await uploadBytes(r, blob, { contentType: "image/jpeg" });
  } catch (e) {
    const codigo = (e as { code?: string })?.code ?? "";
    if (codigo.includes("unauthorized")) {
      throw new Error("Firebase no deja subir la portada: sólo Iris o quien monta este curso pueden hacerlo, y el curso tiene que estar guardado al menos una vez.");
    }
    throw new Error("No se ha podido subir la portada. Revisa la conexión y vuelve a probar.");
  }
  return getDownloadURL(r);
}
