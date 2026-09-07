/**
 * LA PUERTA
 *
 * Aquí está escrito QUÉ se puede hacer con las citas, los clientes y las
 * facturas. No está escrito DÓNDE se guardan, y ése es todo el objetivo.
 *
 * Hoy la implementación es `local.ts`, que escribe en el `localStorage` del
 * navegador porque todavía no hay base de datos —Firebase está esperando a que
 * llegue una tarjeta—. El día que la haya se escribe otra implementación
 * detrás de estas mismas interfaces y las pantallas no se enteran: no importan
 * `localStorage` en ninguna parte, importan `citas`, `clientes` y `facturas` de
 * `./index`.
 *
 * POR QUÉ TODO DEVUELVE UNA PROMESA, si `localStorage` responde al instante.
 *
 * Porque Firebase no. Si estas operaciones fueran síncronas, cambiar de
 * almacén obligaría a reescribir las tres pantallas enteras —que es
 * exactamente lo que esta puerta existe para evitar— y descubriríamos que la
 * abstracción no servía justo el día que hacía falta. Con promesas desde el
 * primer día, las pantallas ya están escritas para esperar, y la mudanza es un
 * archivo.
 */

import type { AvisoVisto, Cita, Cliente, Factura } from "./tipos";

/** Lo que se puede hacer con cualquier cosa guardada. */
export interface Repositorio<T> {
  listar(): Promise<T[]>;
  obtener(id: string): Promise<T | null>;
  /** Crea o actualiza, según si el `id` ya existe. Devuelve lo guardado. */
  guardar(x: T): Promise<T>;
  borrar(id: string): Promise<void>;
}

export interface RepoClientes extends Repositorio<Cliente> {
  /**
   * Buscar por nombre. Va en el repositorio y no en la pantalla porque una
   * base de datos de verdad lo resuelve con un índice: filtrar en memoria vale
   * mientras la lista quepa entera en el navegador, y no siempre cabrá.
   */
  buscar(texto: string): Promise<Cliente[]>;
}

export interface RepoCitas extends Repositorio<Cita> {
  /**
   * Las citas que empiezan dentro de un tramo, ordenadas por hora. Es lo único
   * que pide la agenda —hoy, esta semana— y es también una consulta por rango,
   * que es como se hace en cualquier base de datos.
   */
  entre(desdeISO: string, hastaISO: string): Promise<Cita[]>;
}

export interface RepoFacturas extends Repositorio<Factura> {
  /**
   * Convierte un borrador en factura definitiva: le asigna el número que toca
   * y congela los datos del emisor.
   *
   * LA NUMERACIÓN VIVE AQUÍ, y no en la pantalla, porque «correlativa y sin
   * huecos» es una promesa sobre lo guardado, no sobre lo que se ve. Quien
   * sepa qué facturas hay es el único que puede decir cuál es el número
   * siguiente sin repetirlo — y el día que esto sea Firebase, será una
   * transacción, que es la única forma de que dos pestañas abiertas a la vez no
   * emitan las dos la 2026/007.
   *
   * Falla si el borrador no está completo o si faltan los datos del emisor: una
   * factura sin NIF no es una factura, y es mejor que no salga a que salga mal.
   */
  emitir(id: string): Promise<Factura>;

  /**
   * Deja sin efecto una factura emitida. CONSERVA su número.
   *
   * Es la respuesta a «¿y si hay que borrar una?»: una factura emitida no se
   * borra nunca. Si se borrara, su número se quedaría hueco —2026/003 no
   * existiría— y una serie con huecos no vale: ante una inspección no hay forma
   * de demostrar que ese número no fue una factura que alguien hizo
   * desaparecer. Anulada, el número sigue ocupado, el documento sigue estando y
   * dice bien claro que no tiene efecto.
   */
  anular(id: string, motivo: string): Promise<Factura>;
}

/**
 * QUÉ AVISOS SE HAN VISTO YA.
 *
 * No es un `Repositorio<T>` como los otros tres y no debe serlo: aquí no hay
 * nada que listar, obtener por identificador ni borrar uno a uno. Lo único que
 * se pregunta es «¿de qué me callo?», y lo único que se escribe es «de esto
 * también». Forzarlo dentro de la interfaz genérica obligaría a inventar un
 * `obtener` y un `borrar` que ninguna pantalla va a llamar nunca.
 *
 * Los avisos en sí NO se guardan en ninguna parte: se calculan cada vez desde
 * las citas, las fichas y las facturas (ver `avisos.ts`). Guardarlos sería
 * guardar dos veces el mismo dato, y el día que no cuadraran ninguno serviría.
 */
export interface RepoAvisos {
  vistos(): Promise<AvisoVisto[]>;
  /**
   * Callar uno o varios de golpe. Van juntos y no de uno en uno porque
   * «marcarlo todo como visto» es una sola decisión de Iris: si fueran cinco
   * escrituras, con base de datos serían cinco viajes y cinco ocasiones de que
   * la mitad se guarde y la otra mitad no.
   */
  marcar(avisos: Array<{ id: string; sello: string }>): Promise<void>;
}
