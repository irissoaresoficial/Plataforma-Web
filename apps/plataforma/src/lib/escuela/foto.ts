/**
 * ============================================================================
 * LA FOTO DE CADA UNO
 * ============================================================================
 *
 * Gerson, el 20 de octubre de 2026: «que las personas mismas configuren su
 * espacio: imagen de perfil, porque también sale en la comunidad». Una
 * comunidad de iniciales en círculos de color es un foro; con caras es gente.
 *
 * LA FOTO SE ENCOGE ANTES DE SUBIR. Un móvil hace fotos de 4 MB, y esa foto
 * sale en un círculo de 40 px al lado de cada mensaje: subirla entera sería
 * hacer bajar 4 MB por cada mensaje de la lista. Se recorta al cuadrado del
 * centro y se deja en 512 px, que es de sobra para el círculo más grande que
 * hay (el del perfil) en una pantalla de alta densidad. Pesa unos 40 KB.
 *
 * SIN FIREBASE se guarda en este navegador, para poder trabajar en las
 * pantallas. Lo dice `guardadoEnLaNube`, igual que el resto de la escuela.
 */
import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { almacen, nube } from "@/lib/firebase";

const LADO = 512;
const TOPE = 15 * 1024 * 1024;
const LS = (uid: string) => `es33.foto.${uid}`;

/** La foto guardada en este navegador, sólo en modo local. */
export function fotoLocal(uid: string): string {
  try {
    return localStorage.getItem(LS(uid)) || "";
  } catch {
    return "";
  }
}

/** Recorta al cuadrado del centro y encoge a 512 px, en JPEG. */
async function encoge(f: File): Promise<Blob> {
  const img = await createImageBitmap(f);
  const lado = Math.min(img.width, img.height);
  const lienzo = document.createElement("canvas");
  lienzo.width = LADO;
  lienzo.height = LADO;
  const cx = lienzo.getContext("2d");
  if (!cx) throw new Error("Este navegador no deja preparar la foto.");
  cx.drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, LADO, LADO);
  return await new Promise<Blob>((listo, falla) =>
    lienzo.toBlob((b) => (b ? listo(b) : falla(new Error("No se ha podido preparar la foto."))), "image/jpeg", 0.86)
  );
}

/**
 * Sube la foto y la apunta en la ficha. Devuelve la dirección para pintarla
 * en el momento, sin esperar a volver a leer la ficha.
 */
export async function cambiaFoto(uid: string, f: File): Promise<string> {
  if (!f.type.startsWith("image/")) throw new Error("Eso no es una imagen. Elige una foto.");
  if (f.size > TOPE) throw new Error("Esa foto pesa demasiado. Elige una de menos de 15 MB.");
  const blob = await encoge(f);

  const a = almacen();
  const b = nube();
  if (!a || !b) {
    const url = await new Promise<string>((listo) => {
      const r = new FileReader();
      r.onload = () => listo(String(r.result));
      r.readAsDataURL(blob);
    });
    try {
      localStorage.setItem(LS(uid), url);
    } catch {
      /* sin almacenamiento: se ve hasta recargar */
    }
    return url;
  }

  /* Con la hora en el nombre: si se reutilizara el mismo, los navegadores que
     ya tienen la vieja en caché la seguirían enseñando durante horas. */
  const r = ref(a, `avatares/${uid}/${Date.now()}.jpg`);
  await uploadBytes(r, blob, { contentType: "image/jpeg" });
  const url = await getDownloadURL(r);
  await updateDoc(doc(b, "usuarios", uid), { foto: url });
  return url;
}
