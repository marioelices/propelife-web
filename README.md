# Propelife · web

Web estática (HTML + CSS + JS, sin build) con clasificaciones, partidos, plantillas, MVP, sanciones y lesiones.

- Datos: `window.LIGA_CONFIG.API_URL` (en `config.js`) apunta al despliegue de Apps Script (`...?api=liga`).
  Si está vacío o falla, usa la copia `data/liga.json`.
- Probar en local: `python -m http.server 8765` y abrir http://127.0.0.1:8765
- Publicar: GitHub Pages desde la rama `main`, carpeta raíz.
