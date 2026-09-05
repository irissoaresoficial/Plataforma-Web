/* Silueta y portales de la estructura energética.
 *
 * La figura NO está dibujada a mano: es la lámina de la ficha de Esencias de
 * Vida (NUEVA_FICHA_KABBALAH_IMPRIMIR.pdf, pág. 2), extraída del PDF y
 * trazada píxel a píxel. Va de perfil y lleva su eje curvo y su retícula
 * blanca calcados de la misma lámina. El trazado conserva la orientación del
 * papel —mirando a la derecha—; en pantalla se pinta reflejado para que mire
 * a la izquierda, hacia el 3 (ver ESPEJO_CUERPO).
 *
 * Sobre ella se colocan los diez portales del manual "4. ESTRUCTURA
 * ENERGÉTICA. LEYES UNIVERSALES" (pág. 127 y 143):
 *
 *          2          corona
 *     3         1     cabeza · tercer ojo
 *     4         0     garganta
 *     5         9     pecho
 *     6         8     vientre
 *          7          raíz
 *
 * La lámina trae siete chakras y el manual marca diez portales: no es un
 * mapeo uno a uno. Cada pareja de portales se sienta sobre el cono que le
 * corresponde por anatomía, y el cono del plexo se queda sin pareja, como en
 * el original.
 */

export type PortalCuerpo = {
  /** Portal interno 1..10 tal y como lo numera el motor. */
  portal: number;
  /** Cómo se rotula: el portal 10 se escribe 0. */
  etiqueta: string;
  x: number;
  y: number;
  /** Columna del lienzo: -1 izquierda, 0 eje central, 1 derecha. Como la
   * figura mira a la izquierda, la columna -1 le queda de frente. */
  lado: -1 | 0 | 1;
};

export const VIEWBOX_CUERPO = "0 -48 300 700";
export const EJE_CUERPO = 150;
export const RADIO_PORTAL = 21;

/**
 * La lámina viene de perfil mirando a la derecha y la queremos mirando a la
 * izquierda, hacia el portal 3. En vez de retocar el trazado —que es un calco
 * y conviene dejarlo tal cual— se refleja al pintarlo sobre el eje del cuerpo.
 * Solo afecta a la silueta, al eje curvo y a la retícula: los conos y los
 * números son simétricos o van colocados a mano, y se quedan donde están.
 */
export const ESPEJO_CUERPO = `translate(${EJE_CUERPO * 2} 0) scale(-1 1)`;

export const SILUETA_PERFIL =
  "M155.5 64.0 Q171.7 70.7 175.0 74.0 Q178.3 77.3 178.3 80.7 Q178.3 84.0 179.2 87.3 Q180.2 90.7 180.2 94.0 Q180.2 97.3 180.9 100.7 Q181.7 104.0 183.6 107.3 Q185.5 110.7 182.7 114.0 Q179.8 117.3 179.3 120.7 Q178.8 124.0 177.9 127.3 Q176.9 130.7 167.4 134.0 Q157.9 137.3 157.7 140.7 Q157.4 144.0 157.4 147.3 Q157.4 150.7 160.0 154.0 Q162.6 157.3 165.9 160.7 Q169.3 164.0 172.4 167.3 Q175.5 170.7 178.3 174.0 Q181.2 177.3 184.6 180.7 Q187.9 184.0 189.1 187.3 Q190.2 190.7 191.1 194.0 Q192.1 197.3 192.6 200.7 Q193.1 204.0 192.8 207.3 Q192.6 210.7 192.1 214.0 Q191.7 217.3 190.9 220.7 Q190.2 224.0 189.8 227.3 Q189.3 230.7 188.6 234.0 Q187.9 237.3 187.7 240.7 Q187.4 244.0 187.7 247.3 Q187.9 250.7 188.6 254.0 Q189.3 257.3 189.8 260.6 Q190.2 264.0 190.4 267.4 Q190.7 270.7 190.7 274.0 Q190.7 277.3 190.7 280.6 Q190.7 284.0 190.2 287.4 Q189.8 290.7 189.3 294.0 Q188.8 297.3 188.1 300.6 Q187.4 304.0 186.4 307.4 Q185.5 310.7 184.6 314.0 Q183.6 317.3 183.1 320.6 Q182.6 324.0 182.3 327.4 Q182.1 330.7 182.3 334.0 Q182.6 337.3 182.6 340.6 Q182.6 344.0 182.3 347.4 Q182.1 350.7 182.1 354.0 Q182.1 357.3 181.9 360.6 Q181.7 364.0 181.4 367.4 Q181.2 370.7 180.7 374.0 Q180.2 377.3 179.8 380.6 Q179.3 384.0 178.8 387.4 Q178.3 390.7 177.9 394.0 Q177.4 397.3 176.9 400.6 Q176.4 404.0 175.7 407.4 Q175.0 410.7 174.5 414.0 Q174.0 417.3 173.6 420.6 Q173.1 424.0 171.6 427.4 Q170.2 430.7 169.2 434.0 Q168.3 437.3 167.9 440.6 Q167.4 444.0 166.7 447.4 Q166.0 450.7 164.3 454.0 Q162.6 457.3 160.0 460.6 Q157.4 464.0 156.4 467.4 Q155.5 470.7 154.6 474.0 Q153.6 477.3 152.8 480.6 Q152.1 484.0 151.6 487.4 Q151.2 490.7 150.5 494.0 Q149.8 497.3 149.3 500.6 Q148.8 504.0 148.4 507.4 Q147.9 510.7 147.2 514.0 Q146.4 517.3 145.9 520.6 Q145.5 524.0 145.0 527.4 Q144.5 530.7 144.2 534.0 Q144.0 537.3 143.8 540.6 Q143.6 544.0 143.8 547.4 Q144.0 550.7 146.2 554.0 Q148.3 557.3 155.7 560.6 Q163.1 564.0 175.9 567.4 Q188.8 570.7 187.6 574.0 Q186.4 577.3 176.2 580.6 Q166.0 584.0 174.1 587.4 Q182.1 590.7 190.9 594.0 Q199.8 597.3 196.9 600.6 L194.0 604.0 L165.0 604.0 Q120.2 597.3 118.1 594.0 Q116.0 590.7 116.0 587.4 Q116.0 584.0 116.5 580.6 Q116.9 577.3 117.6 574.0 Q118.3 570.7 118.8 567.4 Q119.3 564.0 119.3 560.6 Q119.3 557.3 118.6 554.0 Q117.9 550.7 117.2 547.4 Q116.4 544.0 115.5 540.6 Q114.5 537.3 113.8 534.0 Q113.1 530.7 112.6 527.4 Q112.1 524.0 111.7 520.6 Q111.2 517.3 111.0 514.0 Q110.7 510.7 110.5 507.4 Q110.2 504.0 110.2 500.6 Q110.2 497.3 110.2 494.0 Q110.2 490.7 110.7 487.4 Q111.2 484.0 111.9 480.6 Q112.6 477.3 113.3 474.0 Q114.0 470.7 115.0 467.4 Q116.0 464.0 117.0 460.6 Q117.9 457.3 119.1 454.0 Q120.2 450.7 121.2 447.4 Q122.1 444.0 122.8 440.6 Q123.6 437.3 124.0 434.0 Q124.5 430.7 124.5 427.4 Q124.5 424.0 124.2 420.6 Q124.0 417.3 123.5 414.0 Q123.1 410.7 122.6 407.4 Q122.1 404.0 121.9 400.6 Q121.7 397.3 121.7 394.0 Q121.7 390.7 121.5 387.4 Q121.2 384.0 120.7 380.6 Q120.2 377.3 119.8 374.0 Q119.3 370.7 118.6 367.4 Q117.9 364.0 117.2 360.6 Q116.4 357.3 115.2 354.0 Q114.0 350.7 112.8 347.4 Q111.7 344.0 110.5 340.6 Q109.3 337.3 108.6 334.0 Q107.9 330.7 107.4 327.4 Q106.9 324.0 106.9 320.6 Q106.9 317.3 107.4 314.0 Q107.9 310.7 108.3 307.4 Q108.8 304.0 110.0 300.6 Q111.2 297.3 112.6 294.0 Q114.0 290.7 115.5 287.4 Q116.9 284.0 117.8 280.6 Q118.8 277.3 119.5 274.0 Q120.2 270.7 120.7 267.4 Q121.2 264.0 121.2 260.6 Q121.2 257.3 120.7 254.0 Q120.2 250.7 119.5 247.3 Q118.8 244.0 117.6 240.7 Q116.4 237.3 114.2 234.0 Q112.1 230.7 111.7 227.3 Q111.2 224.0 109.8 220.7 Q108.3 217.3 106.9 214.0 Q105.5 210.7 104.0 207.3 Q102.6 204.0 101.9 200.7 Q101.2 197.3 101.0 194.0 Q100.7 190.7 101.0 187.3 Q101.2 184.0 102.2 180.7 Q103.1 177.3 104.3 174.0 Q105.5 170.7 107.2 167.3 Q108.8 164.0 110.4 160.7 Q112.1 157.3 113.5 154.0 Q115.0 150.7 116.7 147.3 Q118.3 144.0 119.0 140.7 Q119.8 137.3 121.7 134.0 Q123.6 130.7 123.3 127.3 Q123.1 124.0 121.7 120.7 Q120.2 117.3 118.6 114.0 Q116.9 110.7 115.5 107.3 Q114.0 104.0 113.3 100.7 Q112.6 97.3 112.8 94.0 Q113.1 90.7 113.5 87.3 Q114.0 84.0 115.5 80.7 Q116.9 77.3 120.7 74.0 Q124.5 70.7 128.6 67.3 L132.6 64.0 Z";

/** Eje curvo que recorre el cuerpo, calcado de la lámina. */
export const EJE_CURVO =
  "M151.0 68.3 Q150.5 72.6 150.0 74.8 Q149.5 76.9 149.1 79.0 Q148.6 81.1 147.4 87.5 Q146.2 94.0 145.7 96.2 Q145.2 98.3 144.8 100.4 Q144.3 102.6 144.1 104.8 Q143.8 106.9 143.4 109.0 Q142.9 111.1 142.7 113.2 Q142.4 115.4 141.9 117.6 Q141.4 119.7 141.2 121.8 Q141.0 124.0 140.8 126.2 Q140.5 128.3 140.2 130.4 Q140.0 132.6 139.5 141.1 Q139.0 149.7 139.0 151.8 Q139.0 154.0 139.0 156.2 Q139.0 158.3 139.0 160.4 Q139.0 162.6 139.2 164.8 Q139.5 166.9 139.5 169.0 Q139.5 171.1 139.8 173.2 Q140.0 175.4 140.0 177.6 Q140.0 179.7 140.6 186.1 Q141.2 192.6 141.3 194.8 Q141.4 196.9 141.7 199.0 Q141.9 201.1 142.2 203.2 Q142.4 205.4 142.5 207.6 Q142.6 209.7 142.8 211.8 Q142.9 214.0 143.1 216.2 Q143.3 218.3 143.6 220.4 Q143.8 222.6 143.9 224.8 Q144.0 226.9 144.6 233.3 Q145.2 239.7 145.4 241.8 Q145.7 244.0 145.9 246.2 Q146.2 248.3 146.3 250.4 Q146.4 252.6 146.7 254.8 Q146.9 256.9 147.0 259.0 Q147.1 261.1 147.3 263.2 Q147.6 265.4 147.8 267.5 Q148.1 269.7 148.2 271.9 Q148.3 274.0 148.4 276.1 Q148.6 278.3 148.6 280.5 Q148.6 282.6 148.6 284.8 Q148.6 286.9 148.8 297.6 Q149.0 308.3 149.0 310.5 Q149.0 312.6 149.0 314.8 L149.0 316.9";

/** Alturas de la retícula blanca y hasta dónde llega en cada una. */
export const RETICULA: Array<{ y: number; x1: number; x2: number }> = [
  { y: 86.9, x1: 113.6, x2: 178.8 },
  { y: 140.7, x1: 119.8, x2: 156.0 },
  { y: 185.9, x1: 100.7, x2: 187.9 },
  { y: 232.6, x1: 114.5, x2: 188.8 },
  { y: 298.3, x1: 110.7, x2: 188.8 },
];

/**
 * Los conos de energía, con el tono que traen en la lámina subido de luz para
 * que se lean sobre fondo claro: allí van sobre negro y aquí sobre blanco.
 */
export const CONOS: Array<{ y: number; tono: string }> = [
  { y: 86.9, tono: "#3F5C9E" },
  { y: 140.7, tono: "#2F84A0" },
  { y: 185.9, tono: "#4C8A45" },
  { y: 232.6, tono: "#B08A2A" },
  { y: 298.3, tono: "#B07430" },
];

/** Dónde nace el cono sobre el cuerpo y medio alto de su boca, hacia fuera. */
export const CONO_APEX = 46;
export const CONO_BOCA = 20;
export const CONO_BOCA_X = 8;

/** Corona y raíz: abanico hacia arriba y triángulo hacia abajo, como la lámina. */
export const CONO_CORONA = "M138 64 L162 64 L186 -18 L114 -18 Z";
export const CONO_RAIZ = "M138 316 L162 316 L150 392 Z";

/**
 * Los cuatro pares bajan por el cuerpo a intervalos iguales: cabeza, garganta,
 * pecho y vientre. No se clavan en la altura exacta de cada cono de la lámina
 * porque dos de ellos caen muy juntos y las pastillas se solapaban — en la
 * ficha a mano pasa lo mismo, los círculos no coinciden con las cuñas
 * impresas. En x van fuera del cuerpo, que mide 50 unidades de medio ancho.
 */
export const PORTALES_CUERPO: PortalCuerpo[] = [
  { portal: 2, etiqueta: "2", x: 150, y: 12, lado: 0 },
  { portal: 3, etiqueta: "3", x: 68, y: 90, lado: -1 },
  { portal: 1, etiqueta: "1", x: 232, y: 90, lado: 1 },
  { portal: 4, etiqueta: "4", x: 68, y: 165, lado: -1 },
  { portal: 10, etiqueta: "0", x: 232, y: 165, lado: 1 },
  { portal: 5, etiqueta: "5", x: 68, y: 240, lado: -1 },
  { portal: 9, etiqueta: "9", x: 232, y: 240, lado: 1 },
  { portal: 6, etiqueta: "6", x: 68, y: 315, lado: -1 },
  { portal: 8, etiqueta: "8", x: 232, y: 315, lado: 1 },
  { portal: 7, etiqueta: "7", x: 150, y: 412, lado: 0 },
];
