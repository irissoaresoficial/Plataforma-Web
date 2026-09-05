// Geometría del Árbol de la Vida (10 sefirot, 22 senderos) — igual que en el prototipo.
export type SefKey =
  | "keter" | "hokmah" | "binah" | "jesed" | "gevurah"
  | "tiphereth" | "netsaj" | "hod" | "yesod" | "malkut";

export const SEF: Record<SefKey, { x: number; y: number; c: string; n: string }> = {
  keter: { x: 190, y: 46, c: "#F5F2EA", n: "Keter" },
  hokmah: { x: 300, y: 130, c: "#C3C7CE", n: "Hokmah" },
  binah: { x: 80, y: 130, c: "#2F333B", n: "Binah" },
  jesed: { x: 300, y: 266, c: "#3E77C4", n: "Jesed" },
  gevurah: { x: 80, y: 266, c: "#CE4237", n: "Gevurah" },
  tiphereth: { x: 190, y: 336, c: "#E5B63C", n: "Tiphereth" },
  netsaj: { x: 300, y: 438, c: "#4C9A5A", n: "Netsaj" },
  hod: { x: 80, y: 438, c: "#DE8631", n: "Hod" },
  yesod: { x: 190, y: 510, c: "#A8449B", n: "Yesod" },
  malkut: { x: 190, y: 606, c: "#6C5A38", n: "Malkut" },
};

export const SENDEROS: [SefKey, SefKey][] = [
  ["keter", "hokmah"], ["keter", "binah"], ["keter", "tiphereth"], ["binah", "hokmah"],
  ["hokmah", "tiphereth"], ["hokmah", "jesed"], ["binah", "tiphereth"], ["gevurah", "binah"],
  ["gevurah", "jesed"], ["jesed", "tiphereth"], ["jesed", "netsaj"], ["gevurah", "tiphereth"],
  ["gevurah", "hod"], ["tiphereth", "netsaj"], ["tiphereth", "yesod"], ["tiphereth", "hod"],
  ["hod", "netsaj"], ["yesod", "netsaj"], ["netsaj", "malkut"], ["yesod", "hod"],
  ["hod", "malkut"], ["malkut", "yesod"],
];

/* Colores de los tres caminos. Se usan tal cual sobre el fondo oscuro del
 * panel y sobre el papel crema del estudio, así que cada uno tiene que
 * distinguirse en ambos. */
export const COL: Record<"origen" | "transformacion" | "destino", string> = {
  origen: "#E2574C", // rojo
  transformacion: "#4C8FE0", // azul
  destino: "#9D6BD9", // lila
};

/* Orden fijo de los caminos: fija el color de las líneas paralelas cuando
 * dos caminos caen en el mismo sendero, y el retardo de su animación. */
export const ORDEN_CAMINOS = ["origen", "transformacion", "destino"] as const;
export const IZQ: Partial<Record<SefKey, 1>> = { binah: 1, gevurah: 1, hod: 1 };
