# Guía de edición · Calculadora de ahorro y apartado "Interesados" del Dashboard

Esta guía explica **cómo modificar** las dos piezas que hicimos, sin necesidad de
instalar nada ni saber programar mucho. Léela entera una vez; luego usa el índice.

> Regla de oro: haz **cambios pequeños**, guarda, y comprueba el resultado antes
> de seguir. Si algo se rompe, siempre puedes ver el historial en GitHub y volver
> a la versión anterior.

---

## 0. Qué es cada cosa y dónde vive

| Pieza | Qué es | Dónde vive | Se ve en |
|---|---|---|---|
| **Calculadora** | La web pública de ahorro | Repo GitHub `WEARETIMS/calculadora_we_are_tims` | https://wearetims.github.io/calculadora_we_are_tims/ |
| **Dashboard** | El panel interno (Apps Script) | Google Apps Script (proyecto del dashboard) | La URL `/exec` del dashboard |
| **Apartado "Interesados"** | La sección de leads dentro del dashboard | Repo GitHub `WEARETIMS/Dashboard-changes` (`interesados.js`) + `Interesados.gs` dentro del Apps Script | Dentro del dashboard, menú ☰ → Interesados |
| **Datos de precios** | Honorarios, primas, países | Google Sheet público | La calculadora los lee en vivo |
| **Leads recibidos** | Quién rellenó el formulario | Google Sheet `info_interesados` | El apartado "Interesados" |

**Idea clave:** los dos repos de GitHub están publicados con **GitHub Pages**. Cuando
editas un archivo y guardas ("commit"), la web **se actualiza sola en ~1 minuto**.
No hay que "subir" nada a mano.

---

## 1. Cómo editar cualquier archivo en GitHub (sin instalar nada)

Sirve para los dos repos.

1. Entra en el repositorio en `github.com` (tienes que haber iniciado sesión con
   una cuenta que sea miembro de la organización **WEARETIMS**).
2. Haz clic en el archivo que quieras cambiar (p. ej. `index.html`).
3. Pulsa el **icono del lápiz** (✏️ "Edit this file"), arriba a la derecha.
4. Haz tu cambio en el texto.
5. Abajo, pulsa el botón verde **"Commit changes"** → **"Commit changes"** otra vez.
6. Espera ~1 minuto y **recarga la web con Cmd+Shift+R** (Ctrl+Shift+R en Windows)
   para saltarte la caché y ver el cambio.

> ⚠️ Al editar, **no borres comillas, llaves `{ }` ni comas** de más: son las que
> hacen que el código funcione. Cambia solo el texto que hay entre comillas.

---

## 2. La CALCULADORA (repo `calculadora_we_are_tims`)

Archivos:

- **`index.html`** — estructura y textos por defecto de la web.
- **`styles.css`** — diseño: colores, tamaños, espaciados.
- **`app.js`** — la lógica (cálculos, idiomas, configuración).
- **`assets/`** — el logo (`tims-logo.png`) y el icono de pestaña (`favicon.png`).

### Cambios más habituales

**➤ Cambiar precios (honorarios, primas, países)**
NO se tocan en GitHub. Están en el **Google Sheet** de datos y la web los lee en
vivo. Edita la hoja y la calculadora se actualiza sola (sin tocar código).

**➤ Cambiar textos (títulos, botones, etiquetas) en español o inglés**
En `app.js`, al principio hay un objeto llamado **`I18N`** con dos bloques: `es:`
(español) y `en:` (inglés). Busca la frase y cámbiala entre las comillas. Ejemplo:
```js
q1: "¿Qué perfil necesitas?",   // <- cambia solo lo de entre comillas
```

**➤ Cambiar colores o estilo**
En `styles.css`, arriba del todo, hay un bloque `:root { ... }` con las variables
de color (p. ej. `--indigo`, `--green`). Cambia el código de color (`#4235E3`).

**➤ Cambiar el enlace de Calendly, los países recomendados, etc.**
En `app.js`, al principio, hay constantes fáciles de encontrar:
```js
const CALENDLY_URL = "https://calendly.com/aleix-dalmau-wearetims/30min";
const PAISES_RECOMENDADOS = ["Colombia", "Perú", "Venezuela"];
const LEAD_ORIGEN = "Calculadora de ahorro";
```

**➤ Cambiar el logo o el favicon**
Sustituye los archivos dentro de `assets/` (mismo nombre) subiendo la imagen nueva
por GitHub (en la carpeta `assets`, "Add file" → "Upload files").

**Publicación:** automática. Cada commit republica la web en ~1 min.

---

## 3. El DASHBOARD y el apartado "Interesados"

Aquí hay **dos partes** que se editan en sitios distintos:

### 3.A — El diseño y comportamiento del apartado → `interesados.js` (GitHub)

Vive en el repo **`WEARETIMS/Dashboard-changes`**, archivo **`interesados.js`**.
Es lo que pinta las tarjetas, las pestañas, los filtros, etc.

- Para cambiarlo: github.com → repo `Dashboard-changes` → `interesados.js` → lápiz
  → editar → Commit changes.
- **Se actualiza solo** en el dashboard (no hay que reimplementar nada). Solo
  recarga el dashboard con **Cmd+Shift+R**.

Esto es porque el dashboard carga ese archivo con una línea que ya está puesta en
su `Index.html`:
```html
<script src="https://wearetims.github.io/Dashboard-changes/interesados.js"></script>
```

### 3.B — La conexión con la hoja → `Interesados.gs` (dentro del Apps Script)

Vive **dentro del proyecto de Apps Script** del dashboard, archivo `Interesados.gs`.
Es lo que **lee y escribe** en la hoja `info_interesados` (marcar contactado, notas).

- Para cambiarlo: abre el proyecto de Apps Script → archivo `Interesados.gs` →
  edita → **Guarda** (💾).
- ⚠️ **Muy importante:** después de guardar hay que **reimplementar** para que el
  cambio tenga efecto:
  **Implementar → Gestionar implementaciones → ✏️ (editar) → Versión: Nueva
  versión → Implementar.**
  (Editar la implementación existente mantiene la MISMA URL; así no hay que cambiar
  nada más.)

### ¿Cuándo hay que reimplementar y cuándo no?

| Qué cambias | ¿Reimplementar Apps Script? |
|---|---|
| `interesados.js` (diseño del apartado, en GitHub) | ❌ No. Se actualiza solo (Cmd+Shift+R). |
| `Interesados.gs` (lectura/escritura de la hoja) | ✅ Sí, Nueva versión. |
| El `Index.html` del dashboard | ✅ Sí, Nueva versión. |

---

## 4. El formulario de leads (cómo llega y a dónde va)

- Cuando alguien rellena el formulario o pide reunión en la calculadora, los datos
  se envían a un **Google Apps Script "buzón"** (lo mantiene Arnau) que:
  1. Guarda una fila en la hoja `info_interesados`.
  2. Manda un email de aviso al equipo.
- Ese aviso distingue **formulario** vs **reunión** por un campo `tipo`, y enruta el
  email a quien corresponda.
- La URL de ese buzón está en `app.js` de la calculadora, en la constante
  `CONTACT_ENDPOINT`. Si Arnau cambia el buzón y da una URL nueva, hay que pegarla ahí.

---

## 5. Propiedad y accesos (importante para el traspaso)

Todo está montado a nombre de la **empresa**, no de una persona:

- **GitHub**: los repos están en la organización **WEARETIMS**. Asegúrate de que
  varias personas del equipo sean **Owners** de la organización
  (GitHub → organización → People → invitar con rol **Owner**).
- **GitHub Pages**: se sirve desde esos repos; no hay cuenta aparte.
- **Google Sheet, Apps Script, Calendly**: cuentas de Google de la empresa.

Con esto, cualquiera del equipo con acceso puede mantener todo aunque cambie el
responsable.

---

## 6. Problemas frecuentes

- **"He cambiado algo y no lo veo"** → es la caché. Recarga con **Cmd+Shift+R**, o
  abre en una pestaña de incógnito. En GitHub Pages, espera 1-2 minutos.
- **"El apartado Interesados no carga"** → revisa que el `Index.html` del dashboard
  tenga la línea del `<script src=...interesados.js...>` y que el `Interesados.gs`
  esté guardado y reimplementado.
- **"Cambié el `.gs` y no pasa nada"** → falta **reimplementar** (Nueva versión).
- **"Se rompió la web tras editar"** → en GitHub, pestaña del archivo → historial
  (icono del reloj "History") → abre el commit anterior y restaura. O avisa a quien
  lleve el mantenimiento.

---

_Última actualización de esta guía: revísala si cambia la estructura de los repos._
