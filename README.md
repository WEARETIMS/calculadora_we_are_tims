# Calculadora de ahorro · We Are TIMS

Landing/calculadora de una sola página: un asistente paso a paso que muestra a un
posible cliente cuánto ahorra contratando talento remoto en LATAM con We Are TIMS
frente a España. Sitio **estático** (HTML + CSS + JS, sin backend propio ni build).

- **Datos en vivo**: los honorarios y las primas se leen al cargar desde un Google
  Sheet público. Actualizar precios en la hoja **no requiere tocar la web**.
- **Tipo de cambio automático** (USD→EUR) al cargar.
- **Bilingüe ES/EN** y **conmutador USD/EUR**.
- **Captación de leads**: formulario de contacto y botón de "Agendar reunión"
  (Calendly), que envían los datos a un backend de la empresa (Google Apps Script).

---

## 🔑 Propiedad y traspaso (IMPORTANTE — leer)

Este proyecto está pensado para que lo mantenga **la empresa**, sin depender de
ninguna cuenta personal. Todo lo importante vive en cuentas/servicios de We Are TIMS:

| Pieza | Dónde vive | Quién debe ser dueño |
|---|---|---|
| Código de la web | Repositorio de GitHub | **Organización de GitHub de la empresa** (no un usuario personal) |
| Hosting / publicación | Netlify o Cloudflare Pages | Cuenta creada con **email de empresa** |
| Dominio | `wearetims.com` | Ya es de la empresa |
| Datos (precios) | Google Sheet | Cuenta de Google de la empresa |
| Backend de leads | Google Apps Script | Cuenta de Google de la empresa |

**Al montarlo, hazlo bajo una organización de GitHub de la empresa y añade a varias
personas del equipo como _Owners_.** Así, aunque quien lo montó se vaya, el equipo
conserva el control total.

## ✏️ Cómo editar la web (sin instalar nada)

Como está en GitHub y el hosting republica solo, **cualquiera del equipo puede
editar desde el navegador**:

1. Entra al repositorio en GitHub.
2. Abre el archivo a cambiar (p. ej. `index.html` para textos, `styles.css` para
   colores/estilos, `app.js` para lógica/idiomas).
3. Pulsa el **lápiz (Edit)**, haz el cambio y **Commit changes**.
4. El hosting detecta el cambio y **republica la web en ~1 minuto**. Sin más pasos.

Cambios habituales:
- **Precios**: NO se tocan aquí — se editan en el Google Sheet y la web los coge solos.
- **Textos** (ES/EN): objeto `I18N` en `app.js`.
- **Colores/estilos**: variables al inicio de `styles.css` (`:root`).
- **Constantes de configuración**: al inicio de `app.js` (ver abajo).

## ⚙️ Constantes de configuración (`app.js`, arriba del todo)

| Constante | Para qué |
|---|---|
| `CSV_HONORARIOS` / `CSV_PRIMAS` | URLs del Google Sheet de datos |
| `USD_TO_EUR_FALLBACK` | Tipo de cambio de respaldo si fallan las APIs |
| `CONTACT_ENDPOINT` | URL del backend de leads (Apps Script). Si cambia, actualizar aquí |
| `LEAD_ORIGEN` | Etiqueta de origen que se manda con cada lead (ahora "Calculadora de ahorro") |
| `CALENDLY_URL` | Enlace de Calendly del botón "Agendar reunión" |
| `PAISES_RECOMENDADOS` | Países marcados como recomendados |

## 🗂️ Estructura

```
index.html      Estructura, textos por defecto, meta tags
styles.css      Sistema visual (paleta, layout, responsive)
app.js          Datos → cálculo → render → contacto (todo comentado)
assets/         Logo
apps-script/    Código de referencia del backend de leads (lo gestiona la empresa)
```

## 🚀 Publicar / actualizar

Sitio estático sin build. Conectado a GitHub + Netlify/Cloudflare Pages, cada
`commit` se publica solo. Para probar en local: `python3 -m http.server` dentro de
la carpeta y abrir `http://localhost:8000`.

## 📨 Backend de leads

El formulario y el botón de reunión envían los datos (form-urlencoded) al Apps
Script del buzón de la empresa, que guarda una fila en el Sheet y avisa por email.
Ese backend lo mantiene la empresa por separado (proyecto de Google Apps Script).
La web solo necesita su URL, configurada en `CONTACT_ENDPOINT` (`app.js`). El
backend distingue por el campo `tipo` (`formulario` / `reunion`) para enrutar el
aviso al destinatario correcto.
