# PWA Geo Modular

Práctica Tema 6.3: geolocalización consciente y reutilizable con JavaScript Vanilla.

## Cumple
- `geo-helper.js` modulariza `getCurrentPosition` y `permissions.query` con Promesas (`.then/.catch`, sin `async/await`).
- Flujo de pre-permiso: botón inicial, tarjeta explicativa en `prompt`, lectura directa en `granted`, y plan B en `denied`/errores.
- Diagnóstico de precisión: muestra `accuracy` en metros y etiqueta Alta (<30m) o Aproximada (>=30m).
- Plan B: selector manual de zona si hay rechazo, timeout o indisponibilidad.
- PWA básica: `manifest.json`, `sw.js` con App Shell incluyendo `./geo-helper.js`, rutas relativas.

## Archivos
- `index.html` - UI y orden de scripts (`geo-helper.js` antes de `app.js`)
- `styles.css` - estilos
- `geo-helper.js` - módulo reutilizable de geolocalización
- `app.js` - lógica UI, pre-permiso, consumo del helper, registro SW
- `sw.js` - precaché y fetch cache-first
- `manifest.json` - manifiesto PWA

## Probar local
Servir por HTTPS o localhost (geolocalización no funciona bien en `file://`). Ejemplo:

```powershell
npx serve .
```

Luego abrir la URL local, probar el botón de ubicación y verificar el plan manual.

## Despliegue GitHub Pages
1. Crear repo y subir estos archivos a la raíz.
2. En GitHub: Settings > Pages > Deploy from branch (`main`, `/root`).
3. Abrir la URL HTTPS en laptop y móvil para comparar `accuracy`.
