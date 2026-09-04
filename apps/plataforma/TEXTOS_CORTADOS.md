# Textos del diccionario: revisión contra los manuales originales

Los 694 textos de `src/data/kdata.json` salieron de los manuales de Esencias de
Vida. Una revisión anterior marcó 33 como «cortados» porque acababan sin punto
y a mitad de frase. Se han contrastado uno a uno con el PDF de origen y el
resultado no es el que parecía.

## Lo que se encontró

De los 33:

| Diagnóstico | Cuántos | Qué pasaba |
|---|---|---|
| **Estaban bien** | 18 | El párrafo del manual termina ahí, sin punto final. No faltaba nada. |
| **Cortados de verdad** | 11 | Les faltaba el final de la frase. Recuperado del manual. |
| **Contaminados** | 3 | Llevaban pegado texto de la sección siguiente. Recortado. |
| **Defecto del propio PDF** | 1 | `tareas.3.sanador` acaba en «el mund» **en el PDF**. Se completó a «mundo». |

## Los 11 que estaban cortados (ya completados)

| Clave | Lo que faltaba |
|---|---|
| `ciclos.anioPersonal.6` | año personal 2. |
| `numeros.66.titulo` | también pueden ser apegos emocionales. |
| `numeros.77.titulo` | energía y del espíritu. |
| `numeros.86.titulo` | libertad. |
| `numeros.93.titulo` | me llevan a experimentar mi sabiduría interior. |
| `numeros.94.titulo` | muchas experiencias en la materia para alcanzar la sabiduría. |
| `numeros.104.titulo` | el llamado técnico frío o tecnócrata. |
| `numeros.105.titulo` | Sacerdotisa. |
| `principios.3.titulo` | máxima de algo. |
| `principios.4.titulo` | realizarnos. |
| `principios.9.titulo` | Reconozco mi divinidad. |

## Los 3 contaminados (ya recortados)

| Clave | Qué llevaba de más |
|---|---|
| `ciclos.anioPersonal.9` | 1.112 caracteres: el capítulo entero «20. Cálculo de la energía del día» |
| `ciclos.ciclos.22/4` | 116 caracteres: el arranque de «18.1 Realizaciones» |
| `ciclos.realizaciones.33` | 14 caracteres: el título «18.2 Desafíos» |

## Los 18 que ya estaban bien

`ciclos.anioPersonal.3`, `ciclos.anioPersonal.7`, `ciclos.ciclos.1`,
`ciclos.ciclos.5`, `ciclos.ciclos.7`, `ciclos.ciclos.9`, `ciclos.ciclos.11/2`,
`ciclos.desafios.4`, `ciclos.desafios.9`, `ciclos.etapas9.1`,
`ciclos.etapas9.2`, `ciclos.realizaciones.1`, `ciclos.realizaciones.5`,
`ciclos.realizaciones.9`, `enfermedades.4.fisicas`, `principios.9.texto`,
`tareas.3.texto`, `tareas.5.hiloRojo`.

En todos ellos el manual termina el párrafo sin punto, o el texto acaba en
puntos suspensivos que ya vienen en el original. No hay nada que traer.

## Los números del diccionario están completos

El capítulo 15 del manual de numerología define 108 números —del 10 al 109 más
111, 112, 123, 144, 157, 183, 273, 474 y 666— y los 108 están en el
diccionario. El manual no define el 62 ni el 110, y el diccionario tampoco los
trae: coinciden. Los principios del 0 al 9 viven aparte, en `principios`, que
es como los trata el manual. **No falta ningún número.**

Cuando el motor calcula un número que el manual no define, lo parte en dos
tramos y lee esos, que es como funciona la lectura sobre el papel.

## Ortografía

Repasados los 694 textos con diccionario español. La interfaz está limpia. En
los textos de los manuales se corrigieron 16 sitios, todos heredados de la
extracción o del propio PDF: «Despues»→«Después» (3), «DESPÚES»→«DESPUÉS»,
«asi»→«así», «arbol»→«árbol» (2), «De no ser sí»→«De no ser así», «Es una
año»→«Es un año», «bonda d»→«bondad», «alanzarnos»→«a lanzarnos»,
«radialmente»→«radicalmente», «en si misma»→«en sí misma»,
«autoresponsabilidad»→«autorresponsabilidad», «tensare»→«tensarse» y el «mund»
de arriba.
