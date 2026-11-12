# Ubicato · app unificada

Una sola app web (PWA) para el reto "¿Dónde es el evento?" de TECH MECH 2026. Une tres prototipos del equipo:

| De dónde viene | Qué se quedó |
|---|---|
| **Ubicato** (Gael) · base de la app | PWA instalable y sin internet, marca UCB, eventos por estado, mapa 2D sobre el plano oficial con el grafo de caminos editado a mano, ruta más rápida y accesible, cámara AR con flecha y minimapa, editor de mapa, administración, enlaces `#desde-` y `#ir-` |
| **UbiCato 3D** | Agenda Universitaria real (`eventos.json` + `actualizar_agenda.py`), qué hay en cada piso, maqueta 3D con despiece de pisos, Mi horario con "Sal a las…" y recordatorio `.ics` |
| **UCB Navigator AR** (Santi) | Las 4 esquinas GPS de 14 bloques, usadas para georreferenciar todo el mapa; buscador de oficinas y aulas; la idea de los puntos QR, ahora con QR reales para imprimir |

## El cambio más importante: el GPS ahora coincide con el campus

La app base ubicaba el plano como si su borde superior fuera el norte y cada px midiera 0,2025 m. Al ajustar el plano contra las esquinas que calibró Santi sale otra cosa: **el plano está girado unos 27° respecto al norte y mide 0,173 m por px**. Con ese ajuste los 14 bloques quedan a 4,6 m de error medio (el peor, Bloque K, a 8,5 m). Antes la flecha de la cámara podía apuntar unos 30° desviada y el GPS caía 20 a 40 m lejos.

- La fórmula está en `GEO`, `px2ll()` y `ll2px()` dentro de `index.html`.
- Los datos del mapa (`PLN`, `FON`, `USR`) se guardan en px del plano. El mapa se sigue dibujando con el plano derecho; solo el GPS y la brújula usan coordenadas reales.
- Falta comprobarlo caminando: nadie midió todavía en el sitio con esta versión.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Toda la app |
| `maqueta3d.js` + `lib/three.min.js` + `lib/OrbitControls.js` | Maqueta 3D. Se cargan solo al tocar "3D" en el mapa. Three.js 0.147 va incluido, sin CDN |
| `lib/qrcode.js` | Generador de QR (qrcode-generator, licencia MIT). Se carga al crear un cartel |
| `eventos.json` | Eventos vigentes de la Agenda Universitaria |
| `actualizar_agenda.py` | Genera `eventos.json` desde https://agenda.lpz.ucb.edu.bo/ |
| `.github/workflows/agenda.yml` | Ejecuta el script cada hora en GitHub y guarda el cambio |
| `sw.js`, `manifest.webmanifest`, `icon-*.png`, `plano-ucb.jpg` | Instalación, uso sin internet y plano |

## Probar y publicar

```
python3 -m http.server 8000      # abrir http://localhost:8000
python3 actualizar_agenda.py     # refrescar la agenda a mano
```

Para publicar, sube toda la carpeta (incluida `.github/`) al repositorio con GitHub Pages. La cámara, la brújula y el GPS necesitan HTTPS, que Pages ya da.

## Qué hay de nuevo en cada pantalla

- **Eventos:** salen de la Agenda Universitaria. La agenda no publica hora de fin, así que esos eventos se muestran como "Hoy · empezó a las…" hasta la medianoche. Si no hay `eventos.json`, la app usa los eventos de ejemplo y lo avisa.
- **Mapa:** 2D sobre el plano, o **3D** con la maqueta. Toca un bloque para ver qué hay en cada piso; "Ver los pisos en 3D" lo despieza. Si el evento es en un piso alto, la maqueta lo resalta.
- **Ruta:** buscador ("D17", "Kardex", "Paraninfo") que elige bloque y piso. El último paso dice cuántos pisos subir y si hay ascensor.
- **Cámara:** igual que antes, ahora con rumbos reales.
- **Horario:** tus clases, a qué hora salir desde donde estés y un recordatorio para el calendario. Se guarda solo en el celular.
- **Administrar → Carteles QR:** QR imprimible por punto. Al escanearlo, la app abre ya ubicada ahí (sirve dentro de los bloques, donde el GPS falla).

## Para el pitch

- **Una línea:** "Escanea y llega: los eventos de la UCB en vivo y la ruta más rápida, con flechas en tu cámara".
- **Diferenciales que se pueden mostrar en vivo:** agenda oficial sin que nadie cargue datos; ruta sin gradas; maqueta 3D con pisos; funciona sin internet y sin instalar; carteles QR en cada bloque.
- **Difusión ya incluida:** botón "Compartir" en cada evento (enlace directo a la ruta), "Compartir Ubicato", aviso para instalar y carteles QR.
- **Costo:** no usa servidores ni servicios de pago; GitHub Pages y Actions son gratuitos para un repositorio público.

## Pendiente o supuesto

- Verificar la georreferencia en el campus (ver arriba).
- Los pisos de F, G1, G2, H, I y L se completaron "por similitud", y el reparto D1–D30 de a 6 aulas por piso es una suposición del equipo. Están en `NIV`.
- La maqueta junta G1 y G2 en un solo bloque "G" y F1 y F2 en "F". Los contornos de C, H, J, K y la Capilla se trazaron a ojo sobre el plano.
- El flujo de GitHub Actions no se ha ejecutado nunca; el script no se pudo probar contra la agenda desde aquí.
- `og:image` apunta a `icon-512.png` con ruta relativa; para que WhatsApp muestre la imagen hay que poner la dirección completa del sitio publicado.
- Falta `logo-ucb.png` (la app usa el logo de la web de la UCB como respaldo).
- Falta el desglose de mantenimiento con el tope de Bs 500 al mes que pide el reto.
- No se trajeron: el selector de otros campus (era solo un bloque de referencia) ni el formulario de 4 esquinas por bloque (sus datos ya están dentro de la georreferencia).
- Los datos guardados por versiones anteriores en el celular no se usan (cambió la clave a `ubicato7`), y un `data.json` antiguo tendría coordenadas del sistema viejo.
- El PDF de horarios con datos personales sigue fuera de la carpeta; el horario de ejemplo solo trae siglas.

Para depurar desde la consola existe `window.Ubicato` (`S`, `D`, `R`, `eventos`, `punto()`, `ruta()`, `busca()`, `go()`).
