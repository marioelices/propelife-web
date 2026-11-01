(function () {
  "use strict";

  const app = document.getElementById("app");
  const tabs = document.querySelectorAll("#tabs a");
  let DATA = null;

  // ---------- utilidades ----------
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function norm(t) {
    return String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  function hue(clave) {
    let h = 0;
    for (let i = 0; i < clave.length; i++) h = (h * 31 + clave.charCodeAt(i)) % 360;
    return h;
  }
  // Siglas de 3 letras, unicas en toda la liga. Los equipos "X B" usan 2 letras de X + B.
  let SIGLAS = null;
  function sinAcentos(t) {
    return String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  }
  function construirSiglas() {
    SIGLAS = {};
    const usadas = {};
    const equipos = [];
    DATA.divisiones.forEach(function (d) {
      d.clasificacion.forEach(function (e) { equipos.push(e); });
    });
    equipos.forEach(function (e) {
      if (SIGLAS[e.clave]) return;
      const limpio = sinAcentos(e.equipo).replace(/[^A-Z0-9 ]/g, " ").trim().split(/\s+/);
      const esB = limpio.length > 1 && limpio[limpio.length - 1] === "B";
      const base = (esB ? limpio.slice(0, -1) : limpio).join("");
      const candidatos = [];
      if (esB) {
        candidatos.push(base.slice(0, 2) + "B");
      } else {
        candidatos.push(base.slice(0, 3));
        if (limpio.length > 1) candidatos.push(limpio[0].slice(0, 2) + limpio[1][0]);
      }
      for (let i = 2; i < base.length; i++) candidatos.push(base[0] + base[1] + base[i]);
      let sigla = candidatos.find(function (c) { return c.length === 3 && !usadas[c]; });
      for (let n = 1; !sigla; n++) {
        const c = base.slice(0, 2) + n;
        if (!usadas[c]) sigla = c;
      }
      usadas[sigla] = true;
      SIGLAS[e.clave] = sigla;
    });
  }
  function iniciales(nombre, clave) {
    if (!SIGLAS) construirSiglas();
    return SIGLAS[clave] || sinAcentos(nombre).replace(/[^A-Z0-9]/g, "").slice(0, 3);
  }
  function crest(nombre, clave, big) {
    const h = hue(clave);
    return '<span class="crest' + (big ? " big" : "") + '" style="background:linear-gradient(135deg,hsl(' + h +
      ' 65% 48%),hsl(' + ((h + 40) % 360) + ' 70% 32%))">' + esc(iniciales(nombre, clave)) + "</span>";
  }
  function divisionPorId(id) {
    return DATA.divisiones.find(function (d) { return d.id === id; }) || DATA.divisiones[0];
  }
  function nombreEquipo(div, clave, respaldo) {
    const c = div.clasificacion.find(function (e) { return e.clave === clave; });
    if (c) return c.equipo;
    const p = div.equipos.find(function (e) { return e.clave === clave; });
    return p ? p.equipo : respaldo;
  }
  // Jornada en curso: la primera con algún partido sin jugar (o la última).
  function jornadaActual(div) {
    const js = {};
    div.partidos.forEach(function (p) {
      js[p.jornada] = js[p.jornada] || { total: 0, jugados: 0 };
      js[p.jornada].total++;
      if (p.jugado) js[p.jornada].jugados++;
    });
    const nums = Object.keys(js).map(Number).sort(function (a, b) { return a - b; });
    for (let i = 0; i < nums.length; i++) if (js[nums[i]].jugados < js[nums[i]].total) return nums[i];
    return nums.length ? nums[nums.length - 1] : 1;
  }
  function pills(items, activo, hrefFn) {
    return '<div class="pills">' + items.map(function (it) {
      return '<a class="pill' + (it.id === activo ? " on" : "") + '" href="' + hrefFn(it.id) + '">' + esc(it.nombre) + "</a>";
    }).join("") + "</div>";
  }
  function selectorDivision(activo, tab) {
    return pills(DATA.divisiones.map(function (d) { return { id: d.id, nombre: d.nombre }; }),
      activo, function (id) { return "#/" + tab + "/" + id; });
  }
  function chipsBajas(j, actual) {
    let out = "";
    if (j.sanc.length) out += '<span class="badge b-sanc' + (j.sanc.some(function (n) { return n >= actual; }) ? "" : " b-old") +
      '" title="Sancionado">&#128721; ' + j.sanc.map(function (n) { return "J" + n; }).join(", ") + "</span> ";
    if (j.les.length) out += '<span class="badge b-les' + (j.les.some(function (n) { return n >= actual; }) ? "" : " b-old") +
      '" title="Lesionado">&#129657; ' + j.les.map(function (n) { return "J" + n; }).join(", ") + "</span>";
    return out;
  }

  // ---------- vistas ----------
  const ZONAS = {
    ascenso: { clase: "z-asc", texto: function (div) { return div.id === "1" ? "Campeón" : "Ascenso"; } },
    promo_asc: { clase: "z-pasc", texto: function () { return "Promoción de ascenso"; } },
    promo_desc: { clase: "z-pdes", texto: function () { return "Promoción de permanencia"; } },
    descenso: { clase: "z-des", texto: function () { return "Descenso"; } }
  };
  function leyendaZonas(div) {
    const orden = ["ascenso", "promo_asc", "promo_desc", "descenso"];
    const usadas = orden.filter(function (z) { return div.clasificacion.some(function (e) { return e.zona === z; }); });
    if (!usadas.length) return "";
    return '<div class="legend">' + usadas.map(function (z) {
      return '<span><i class="dot ' + ZONAS[z].clase + '"></i>' + esc(ZONAS[z].texto(div)) + "</span>";
    }).join("") + "</div>";
  }

  function vistaClasificacion(divId) {
    const div = divisionPorId(divId);
    let h = "<h1>Clasificación</h1>" +
      '<p class="sub">' + esc(div.nombre) + " división</p>" + selectorDivision(div.id, "clasificacion");
    if (!div.clasificacion.length) return h + '<p class="empty">Sin datos de clasificación.</p>';
    h += '<div class="card scroll"><table><thead><tr><th>#</th><th class="l sticky">Equipo</th><th>PJ</th>' +
      '<th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th></tr></thead><tbody>';
    div.clasificacion.forEach(function (e) {
      const dg = e.dif == null ? 0 : e.dif;
      h += '<tr class="' + (ZONAS[e.zona] ? ZONAS[e.zona].clase : "") + '"><td class="pos">' + e.pos + '</td>' +
        '<td class="l sticky"><a class="team-cell" href="#/plantillas/' + div.id + "/" + e.clave + '">' + crest(e.equipo, e.clave) +
        "<span>" + esc(e.equipo) + "</span></a></td>" +
        "<td>" + (e.pj == null ? "-" : e.pj) + '</td><td>' + (e.pg == null ? "-" : e.pg) +
        '</td><td>' + (e.pe == null ? "-" : e.pe) + '</td><td>' + (e.pp == null ? "-" : e.pp) +
        "</td><td>" + (e.gf == null ? "-" : e.gf) + "</td><td>" + (e.gc == null ? "-" : e.gc) +
        '</td><td class="dif ' + (dg > 0 ? "p" : dg < 0 ? "n" : "") + '">' + (dg > 0 ? "+" : "") + dg +
        '</td><td class="pts">' + (e.pts == null ? 0 : e.pts) + "</td></tr>";
    });
    return h + "</tbody></table></div>" + leyendaZonas(div);
  }

  // Incidencias de un equipo en la jornada j (a partir de las columnas TR, SANC y LES).
  //  - lesionados: LES contiene j
  //  - sancionados: SANC contiene j (no juegan ese partido)
  //  - expulsados: tienen rojas (TR>0) y su sanción empieza en j+1; es una deducción,
  //    el Excel no guarda en qué partido se vio la roja.
  function incidenciasEquipo(div, clave, jornada, jugado) {
    const eq = div.equipos.find(function (e) { return e.clave === clave; });
    const r = { exp: [], sanc: [], les: [] };
    if (!eq) return r;
    eq.jugadores.forEach(function (j) {
      if (j.les.indexOf(jornada) !== -1) r.les.push(j.nombre);
      if (j.sanc.indexOf(jornada) !== -1) r.sanc.push(j.nombre);
      if (jugado && j.tr > 0 && j.sanc.indexOf(jornada + 1) !== -1 && j.sanc.indexOf(jornada) === -1) r.exp.push(j.nombre);
    });
    return r;
  }
  function chipsIncidencias(inc) {
    const out = [];
    inc.exp.forEach(function (n) { out.push('<span class="inc i-exp" title="Expulsado">&#128997; ' + esc(n) + "</span>"); });
    inc.sanc.forEach(function (n) { out.push('<span class="inc i-sanc" title="Sancionado: no juega">&#128721; ' + esc(n) + "</span>"); });
    inc.les.forEach(function (n) { out.push('<span class="inc i-les" title="Lesionado: no juega">&#129657; ' + esc(n) + "</span>"); });
    return out.join("");
  }

  // Banner con la fecha límite de las jornadas publicadas (la API la sirve en fechasLimite).
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  function bannerFecha(jornada) {
    const f = DATA.fechasLimite && DATA.fechasLimite[jornada];
    const m = f && /^(\d{4})-(\d{2})-(\d{2})$/.exec(f);
    if (!m) return "";
    const fecha = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const pasada = new Date(+m[1], +m[2] - 1, +m[3]) < hoy;
    return '<div class="banner' + (pasada ? " banner-old" : "") + '"><div class="b-tit">&#9203; Fecha límite: ' +
      DIAS[fecha.getUTCDay()] + " " + (+m[3]) + " de " + MESES[+m[2] - 1] + " de " + m[1] + ", 23:59" + (pasada ? " (vencida)" : "") + "</div>" +
      "<div>Los mánagers deben ponerse en contacto para jugar al menos 24 h antes del fin de la jornada.</div></div>";
  }

  // ---------- capturas de partido ----------
  // Id estable del partido: igual que Cap_hash_ del bot (FNV-1a de "localClave|visitanteClave").
  function capHash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h.toString(36);
  }
  const MODO_CAPTURAS = /[?&]capturas=1/.test(location.search + location.hash);
  function idPartido(p) { return p.jornada + "_" + capHash(p.localClave + "|" + p.visitanteClave); }
  function capturasVisibles(p) {
    const todas = (DATA.capturas && DATA.capturas[idPartido(p)]) || [];
    return todas.filter(function (c) { return MODO_CAPTURAS || !c.p; });
  }
  function enlacePartido(div, p) { return "#/partido/" + div.id + "/" + p.jornada + "/" + capHash(p.localClave + "|" + p.visitanteClave); }
  function insigniaCaptura(p) {
    const n = capturasVisibles(p).length;
    return n ? '<span class="cap-n" title="Capturas del partido">&#128247; ' + n + "</span>" : "";
  }
  function galeriaCapturas(p, loc, vis2) {
    const vis = capturasVisibles(p);
    const bot = window.LIGA_CONFIG && window.LIGA_CONFIG.BOT_USERNAME;
    const boton = bot ? '<a class="cap-btn" href="https://t.me/' + esc(bot) + "?start=c" + idPartido(p) + '" target="_blank" rel="noopener">&#128247; Enviar captura por Telegram</a>' : "";
    let h = '<h2 class="mp-h">Capturas</h2>';
    if (!vis.length) h += '<p class="empty">Todavía no hay capturas de este partido.</p>';
    else h += '<div class="gal">' + vis.map(function (c) {
      const quien = c.s === "L" ? "Enviada por " + loc : c.s === "V" ? "Enviada por " + vis2 : c.s === "A" ? "Enviada por el admin" : "Equipo no identificado";
      const cuando = c.t ? new Date(c.t).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";
      return '<figure class="gal-f"><a class="gal-i" href="https://drive.google.com/file/d/' + esc(c.id) + '/view" target="_blank" rel="noopener">' +
        '<img loading="lazy" alt="Captura del partido" src="https://drive.google.com/thumbnail?id=' + esc(c.id) + '&sz=w1000">' + (c.p ? '<span class="cap-p">prueba</span>' : "") + "</a>" +
        '<figcaption><b>' + esc(quien) + "</b>" + (cuando ? " · " + esc(cuando) : "") + "</figcaption></figure>";
    }).join("") + "</div>";
    const subir = window.LIGA_CONFIG && window.LIGA_CONFIG.API_URL ? '<button type="button" class="cap-btn" data-subir="' + esc(idPartido(p)) + '">&#128247; Subir foto desde el móvil</button>' : "";
    return h + (boton || subir ? '<div class="caps">' + subir + boton + "</div>" : "");
  }

  // ---------- subida de captura desde la web (sin Telegram) ----------
  function abrirSubida(id) {
    const guardado = (function () { try { return localStorage.getItem("liga_pin") || ""; } catch (e) { return ""; } })();
    const ov = document.createElement("div");
    ov.className = "sub-ov";
    ov.innerHTML = '<div class="sub-box"><h3>Subir captura del partido</h3>' +
      '<label class="sub-l">PIN de tu equipo<input type="password" class="sub-pin" autocomplete="off" autocapitalize="characters" maxlength="6" value="' + esc(guardado) + '"></label>' +
      '<p class="sub-l">Puedes enviar hasta 2 imágenes a la vez (si los jugadores no caben en una sola pantalla).</p>' +
      '<div class="sub-btns"><label class="cap-btn">&#128247; Hacer foto<input type="file" accept="image/*" capture="environment" hidden class="sub-cam"></label>' +
      '<label class="cap-btn">&#128193; Elegir imagen<input type="file" accept="image/*" multiple hidden class="sub-gal"></label></div>' +
      '<div class="sub-thumbs"></div><p class="sub-msg"></p>' +
      '<div class="sub-btns"><button type="button" class="cap-btn sub-send" disabled>Enviar</button><button type="button" class="cap-btn sub-close">Cerrar</button></div></div>';
    document.body.appendChild(ov);
    const q = function (s) { return ov.querySelector(s); };
    const fotos = [];   // blobs reducidos (máx. 2)
    const msg = function (t, err) { const m = q(".sub-msg"); m.textContent = t; m.className = "sub-msg" + (err ? " err" : ""); };
    function pintar() {
      q(".sub-thumbs").innerHTML = fotos.map(function (f, i) {
        return '<span class="sub-t"><img alt="" src="' + f.url + '"><button type="button" data-q="' + i + '" aria-label="Quitar">&times;</button></span>';
      }).join("");
      q(".sub-send").disabled = !fotos.length;
    }
    function elegir(ev) {
      const lista = Array.prototype.slice.call(ev.target.files || [], 0, 2 - fotos.length);
      ev.target.value = "";
      if (!lista.length) { if (fotos.length >= 2) msg("Ya tienes 2 imágenes. Quita una para cambiarla.", true); return; }
      msg("Preparando la imagen…");
      Promise.all(lista.map(reducir)).then(function (bs) {
        bs.forEach(function (b) { b.url = URL.createObjectURL(b); fotos.push(b); });
        pintar(); msg(fotos.length + (fotos.length === 1 ? " imagen lista." : " imágenes listas.") + (fotos.length < 2 ? " Si hace falta una segunda pantalla, añádela." : ""));
      }).catch(function () { msg("No he podido leer esa imagen.", true); });
    }
    q(".sub-cam").addEventListener("change", elegir);
    q(".sub-gal").addEventListener("change", elegir);
    q(".sub-thumbs").addEventListener("click", function (ev) {
      const b = ev.target.closest("[data-q]"); if (!b) return;
      fotos.splice(Number(b.getAttribute("data-q")), 1); pintar(); msg(fotos.length ? "" : "Elige o haz una foto.");
    });
    q(".sub-close").addEventListener("click", function () { ov.remove(); });
    function enviarUna(pin, blob) {
      return new Promise(function (ok, ko) {
        const fr = new FileReader();
        fr.onerror = ko;
        fr.onload = function () {
          fetch(window.LIGA_CONFIG.API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ a: "subir", pin: pin, id: id, img: String(fr.result).split(",")[1] }) })
            .then(function (r) { return r.json(); }).then(ok, ko);
        };
        fr.readAsDataURL(blob);
      });
    }
    q(".sub-send").addEventListener("click", function () {
      const pin = q(".sub-pin").value.trim().toUpperCase();
      if (!pin) { msg("Escribe el PIN de tu equipo.", true); return; }
      if (!fotos.length) return;
      q(".sub-send").disabled = true;
      const total = fotos.length;
      let hechas = 0, ultimo = null;
      (function siguiente() {
        if (!fotos.length) {
          try { localStorage.setItem("liga_pin", pin); } catch (e) {}
          msg("✅ " + (hechas === 1 ? "Captura subida" : hechas + " capturas subidas") + " (" + ultimo.n + " de " + ultimo.max + " en este partido). Aparecerán en la ficha en un minuto.");
          pintar(); return;
        }
        msg("Enviando " + (hechas + 1) + " de " + total + "…");
        enviarUna(pin, fotos[0]).then(function (r) {
          if (!r.ok) { msg((hechas ? "✅ " + hechas + " subida(s). " : "") + "❌ " + (r.error || "No se ha podido subir."), true); pintar(); return; }
          ultimo = r; hechas++; fotos.shift(); pintar(); q(".sub-send").disabled = true; siguiente();
        }).catch(function () { msg("❌ No he podido conectar. Revisa la cobertura e inténtalo otra vez.", true); pintar(); });
      })();
    });
  }
  function reducir(file) {
    return new Promise(function (ok, ko) {
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        const k = Math.min(1, 1600 / Math.max(im.width, im.height));
        const c = document.createElement("canvas");
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        c.toBlob(function (b) { URL.revokeObjectURL(url); b ? ok(b) : ko(); }, "image/jpeg", 0.82);
      };
      im.onerror = ko; im.src = url;
    });
  }
  document.addEventListener("click", function (ev) {
    const b = ev.target.closest && ev.target.closest("[data-subir]");
    if (b) abrirSubida(b.getAttribute("data-subir"));
  });

  function bloqueOcr(p, loc, vis2) {
    const o = DATA.ocr && DATA.ocr[idPartido(p)];
    if (!o) return "";
    const bajas = (o.a || []).map(function (b) {
      return '<span class="inc ' + (b[0] === "S" ? "i-sanc" : "i-les") + '">' + (b[0] === "S" ? "&#128721;" : "&#129657;") + " " + esc(b[1]) + " <small>(" + esc(b[2]) + ")</small></span>";
    }).join("");
    let h = '<h2 class="mp-h">&#128270; Lectura de las capturas <span class="beta">en pruebas</span></h2><div class="card mp-ocr">';
    h += "<p>Marcador leído: <b>" + (o.m ? esc(o.m.replace("-", " - ")) : "no detectado") + "</b></p>";
    h += bajas ? "<p>Aparecen en la captura jugadores que constan como sancionados o lesionados:</p><div class=\"chips\">" + bajas + "</div>" :
      "<p>&#9989; No se ha detectado ningún lesionado ni sancionado en la captura.</p>";
    h += '<p class="nota">Lectura automática con OCR: puede fallar. No modifica la clasificación ni el Excel.</p></div>';
    return h;
  }

  function vistaPartido(divId, jornadaParam, hash) {
    const div = divisionPorId(divId);
    const jornada = Number(jornadaParam);
    const p = div.partidos.find(function (x) { return x.jornada === jornada && capHash(x.localClave + "|" + x.visitanteClave) === hash; });
    const volver = "#/partidos/" + div.id + "/" + jornada;
    if (!p) return '<a class="back" href="' + volver + '">&#8249; Partidos</a><p class="empty">No encuentro ese partido.</p>';
    const loc = nombreEquipo(div, p.localClave, p.local), vis = nombreEquipo(div, p.visitanteClave, p.visitante);
    const il = incidenciasEquipo(div, p.localClave, jornada, p.jugado), iv = incidenciasEquipo(div, p.visitanteClave, jornada, p.jugado);
    let h = '<a class="back" href="' + volver + '">&#8249; Jornada ' + jornada + "</a>" +
      "<h1>" + esc(loc) + " vs " + esc(vis) + "</h1>" + '<p class="sub">' + esc(div.nombre) + " división · Jornada " + jornada + (p.jugado ? " · jugado" : " · pendiente") + "</p>" +
      '<div class="card"><div class="match"><div class="t r"><span>' + esc(loc) + "</span>" + crest(loc, p.localClave) + "</div>" +
      (p.jugado ? '<div class="score">' + p.golesLocal + " - " + p.golesVisitante + "</div>" : '<div class="score pend">vs</div>') +
      '<div class="t">' + crest(vis, p.visitanteClave) + "<span>" + esc(vis) + "</span></div></div></div>";
    h += bannerFecha(jornada);
    function col(nombre, lista) {
      return "<div><b>" + esc(nombre) + '</b><div class="chips">' + (lista || '<span class="empty">Ninguno</span>') + "</div></div>";
    }
    function chips(arr, cls, ico, tit) {
      return arr.map(function (n) { return '<span class="inc ' + cls + '" title="' + tit + '">' + ico + " " + esc(n) + "</span>"; }).join("");
    }
    h += '<h2 class="mp-h">&#129657; Lesionados</h2><div class="card mp-inc">' +
      col(loc, chips(il.les, "i-les", "&#129657;", "Lesionado: no juega")) + col(vis, chips(iv.les, "i-les", "&#129657;", "Lesionado: no juega")) + "</div>";
    h += '<h2 class="mp-h">&#128721; Sancionados</h2><div class="card mp-inc">' +
      col(loc, chips(il.exp, "i-exp", "&#128997;", "Expulsado en este partido") + chips(il.sanc, "i-sanc", "&#128721;", "Sancionado: no juega")) +
      col(vis, chips(iv.exp, "i-exp", "&#128997;", "Expulsado en este partido") + chips(iv.sanc, "i-sanc", "&#128721;", "Sancionado: no juega")) + "</div>";
    return h + bloqueOcr(p, loc, vis) + galeriaCapturas(p, loc, vis);
  }

  function vistaPartidos(divId, jornadaParam) {
    const div = divisionPorId(divId);
    const nums = Array.from(new Set(div.partidos.map(function (p) { return p.jornada; }))).sort(function (a, b) { return a - b; });
    let h = "<h1>Partidos</h1>" + '<p class="sub">' + esc(div.nombre) + " división</p>" + selectorDivision(div.id, "partidos");
    if (!nums.length) return h + '<p class="empty">Sin calendario.</p>';
    let jornada = Number(jornadaParam) || jornadaActual(div);
    if (nums.indexOf(jornada) === -1) jornada = nums[0];
    const i = nums.indexOf(jornada);
    const base = "#/partidos/" + div.id + "/";
    h += '<div class="jornada-bar">' +
      '<button class="nav" ' + (i === 0 ? "disabled" : 'data-go="' + base + nums[i - 1] + '"') + ' aria-label="Anterior">&#8249;</button>' +
      '<select id="selJornada" aria-label="Jornada">' + nums.map(function (n) {
        return '<option value="' + n + '"' + (n === jornada ? " selected" : "") + ">Jornada " + n + "</option>";
      }).join("") + "</select>" +
      '<button class="nav" ' + (i === nums.length - 1 ? "disabled" : 'data-go="' + base + nums[i + 1] + '"') + ' aria-label="Siguiente">&#8250;</button></div>';
    h += bannerFecha(jornada);
    const lista = div.partidos.filter(function (p) { return p.jornada === jornada; });
    h += '<div class="card">' + lista.map(function (p) {
      const loc = nombreEquipo(div, p.localClave, p.local), vis = nombreEquipo(div, p.visitanteClave, p.visitante);
      const ci = chipsIncidencias(incidenciasEquipo(div, p.localClave, jornada, p.jugado));
      const vi = chipsIncidencias(incidenciasEquipo(div, p.visitanteClave, jornada, p.jugado));
      return '<div class="mwrap' + (insigniaCaptura(p) ? ' hecho' : '') + '"><a class="mlink" href="' + enlacePartido(div, p) + '"><div class="match"><div class="t r"><span>' + esc(loc) + "</span>" + crest(loc, p.localClave) + "</div>" +
        (p.jugado ? '<div class="score">' + p.golesLocal + " - " + p.golesVisitante + "</div>" : '<div class="score pend">vs</div>') +
        '<div class="t">' + crest(vis, p.visitanteClave) + "<span>" + esc(vis) + "</span></div>" + "</div></a>" +
        (ci || vi ? '<div class="incs"><div class="r">' + ci + "</div><div></div><div>" + vi + "</div></div>" : "") + "</div>";
    }).join("") + "</div>" +
      '<div class="legend"><span>&#128997; Expulsado</span><span>&#128721; Sancionado</span><span>&#129657; Lesionado</span></div>';
    return h;
  }

  function resumenEquipo(eq, actual) {
    let sanc = 0, les = 0, mvp = 0, tr = 0;
    eq.jugadores.forEach(function (j) {
      if (j.sanc.some(function (n) { return n >= actual; })) sanc++;
      if (j.les.some(function (n) { return n >= actual; })) les++;
      mvp += j.mvp; tr += j.tr;
    });
    return { sanc: sanc, les: les, mvp: mvp, tr: tr };
  }

  function vistaPlantillas(divId, clave) {
    const div = divisionPorId(divId);
    const actual = jornadaActual(div);
    if (clave) {
      const eq = div.equipos.find(function (e) { return e.clave === clave; });
      if (eq) return vistaEquipo(div, eq, actual);
    }
    let h = "<h1>Plantillas</h1>" + '<p class="sub">' + esc(div.nombre) + " división</p>" + selectorDivision(div.id, "plantillas") +
      '<input class="search" id="buscar" type="search" placeholder="Buscar jugador en toda la liga…" autocomplete="off">' +
      '<div id="resultados"></div><div class="grid" id="equipos">';
    div.equipos.forEach(function (eq) {
      const r = resumenEquipo(eq, actual);
      h += '<a class="tcard" href="#/plantillas/' + div.id + "/" + eq.clave + '">' + crest(eq.equipo, eq.clave, true) +
        "<div><b>" + esc(eq.equipo) + "</b><small>" + esc(eq.manager) + "</small>" +
        '<div class="tbadges">' + (r.sanc ? '<span class="badge b-sanc">&#128721; ' + r.sanc + "</span>" : "") +
        (r.les ? '<span class="badge b-les">&#129657; ' + r.les + "</span>" : "") + "</div></div></a>";
    });
    return h + "</div>";
  }

  function vistaEquipo(div, eq, actual) {
    const r = resumenEquipo(eq, actual);
    let h = '<a class="back" href="#/plantillas/' + div.id + '">&#8592; ' + esc(div.nombre) + "</a>" +
      '<div class="team-head">' + crest(eq.equipo, eq.clave, true) + "<div><h1>" + esc(eq.equipo) + '</h1><p class="sub" style="margin:0">Manager: ' +
      esc(eq.manager) + "</p></div></div>" +
      '<div class="kpis"><div class="kpi"><b>' + eq.jugadores.length + "</b><span>Jugadores</span></div>" +
      '<div class="kpi"><b>' + r.mvp + "</b><span>MVP</span></div>" +
      '<div class="kpi"><b>' + r.tr + "</b><span>Rojas</span></div>" +
      '<div class="kpi"><b>' + r.sanc + "</b><span>Sancionados</span></div>" +
      '<div class="kpi"><b>' + r.les + "</b><span>Lesionados</span></div></div>" +
      '<div class="card scroll"><table><thead><tr><th class="l">Jugador</th><th>MVP</th><th>TR</th><th class="l">Estado</th></tr></thead><tbody>';
    eq.jugadores.forEach(function (j) {
      const estado = chipsBajas(j, actual) || '<span class="ok">Disponible</span>';
      h += '<tr><td class="l pname">' + esc(j.nombre) + "</td><td>" + (j.mvp ? '<span class="badge b-mvp">&#9733; ' + j.mvp + "</span>" : '<span class="ok">-</span>') +
        "</td><td>" + (j.tr || '<span class="ok">-</span>') + '</td><td class="l">' + estado + "</td></tr>";
    });
    return h + "</tbody></table></div>";
  }

  function vistaBajas(soloActivas) {
    let h = "<h1>Bajas</h1>" + '<p class="sub">Sancionados y lesionados por división</p>' +
      '<label class="toggle"><input type="checkbox" id="chkTodas"' + (soloActivas ? "" : " checked") + "> Incluir ya cumplidas</label>";
    DATA.divisiones.forEach(function (div) {
      const actual = jornadaActual(div);
      const filas = [];
      div.equipos.forEach(function (eq) {
        eq.jugadores.forEach(function (j) {
          const activa = j.sanc.some(function (n) { return n >= actual; }) || j.les.some(function (n) { return n >= actual; });
          if ((j.sanc.length || j.les.length) && (activa || !soloActivas)) filas.push({ eq: eq, j: j });
        });
      });
      h += '<div class="sec-title">' + esc(div.nombre) + " · jornada " + actual + "</div>";
      if (!filas.length) { h += '<div class="card"><p class="empty">Sin bajas.</p></div>'; return; }
      h += '<div class="card">' + filas.map(function (f) {
        return '<div class="baja-row">' + crest(f.eq.equipo, f.eq.clave) + '<div class="who"><b>' + esc(f.j.nombre) + "</b><small>" +
          esc(f.eq.equipo) + "</small></div><div>" + chipsBajas(f.j, actual) + "</div></div>";
      }).join("") + "</div>";
    });
    return h;
  }

  // ---------- búsqueda de jugadores ----------
  function activarBusqueda() {
    const input = document.getElementById("buscar");
    const out = document.getElementById("resultados");
    const grid = document.getElementById("equipos");
    if (!input) return;
    input.addEventListener("input", function () {
      const q = norm(input.value).trim();
      if (q.length < 2) { out.innerHTML = ""; grid.style.display = ""; return; }
      const res = [];
      DATA.divisiones.forEach(function (div) {
        const actual = jornadaActual(div);
        div.equipos.forEach(function (eq) {
          eq.jugadores.forEach(function (j) {
            if (norm(j.nombre).indexOf(q) !== -1) res.push({ div: div, eq: eq, j: j, actual: actual });
          });
        });
      });
      grid.style.display = "none";
      out.innerHTML = res.length ? '<div class="card">' + res.slice(0, 40).map(function (r) {
        return '<a class="baja-row" href="#/plantillas/' + r.div.id + "/" + r.eq.clave + '">' + crest(r.eq.equipo, r.eq.clave) +
          '<div class="who"><b>' + esc(r.j.nombre) + "</b><small>" + esc(r.eq.equipo) + " · " + esc(r.div.nombre) + "</small></div><div>" +
          chipsBajas(r.j, r.actual) + "</div></a>";
      }).join("") + "</div>" : '<p class="empty">Sin resultados.</p>';
    });
  }

  // ---------- palmares ----------
  function vistaPalmares() {
    const P = window.PALMARES;
    if (!P) return '<p class="empty">Palmarés no disponible.</p>';
    const ult = P.temporadas[P.temporadas.length - 1];
    const n = function (x) { return x ? x : '<span class="cero">0</span>'; };
    let h = "<h1>Palmarés</h1>" + '<p class="sub">Historial de campeones de la FIPA · ' + P.temporadas.length + " temporadas</p>";
    h += '<p class="sub">Campeones de la última temporada (' + esc(ult.t) + ")</p>";
    h += '<div class="pal-top">' + [["🏆", "1ª División", ult.d1], ["🥈", "2ª División", ult.d2], ["🏅", "Copa", ult.copa]].map(function (x) {
      return '<div class="fact"><div class="fi">' + x[0] + "</div><span>" + x[1] + "</span><b>" + esc(x[2]) + "</b></div>";
    }).join("") + "</div>";
    h += '<details class="rsec" open><summary><span>📊</span><span>Ranking global</span></summary><div class="rbody"><div class="rtab-wrap"><table class="rtab pal"><thead><tr><th class="num">#</th><th>Equipo</th><th class="num">1ª<br>×3</th><th class="num">2ª<br>×1</th><th class="num">Copa<br>×2</th><th class="num">Coef</th><th class="num">Tít.</th></tr></thead><tbody>' +
      P.ranking.map(function (r) {
        const m = "";
        return '<tr class="' + (r.pos === 1 ? "pod1" : "") + '"><td class="num">' + m + r.pos + '</td><td class="eq">' + esc(r.equipo) + '</td><td class="num">' + n(r.d1) + '</td><td class="num">' + n(r.d2) + '</td><td class="num">' + n(r.copa) + '</td><td class="num top">' + r.coef + '</td><td class="num">' + n(r.titulos) + "</td></tr>";
      }).join("") + "</tbody></table></div></div></details>";
    h += '<details class="rsec"><summary><span>📅</span><span>Temporadas</span></summary><div class="rbody"><div class="rtab-wrap"><table class="rtab"><thead><tr><th>Temp</th><th>1ª Div</th><th>2ª Div</th><th>Copa</th></tr></thead><tbody>' +
      P.temporadas.slice().reverse().map(function (t) {
        return "<tr><td>" + esc(t.t) + '</td><td class="eq">' + esc(t.d1) + "</td><td>" + esc(t.d2) + "</td><td>" + esc(t.copa) + "</td></tr>";
      }).join("") + "</tbody></table></div></div></details>";
    return h;
  }

  // ---------- reglas ----------
  function resaltarImportes(t) {
    return esc(t).replace(/(\d+(?:,\d+)? millones)/g, '<span class="eur">$1</span>');
  }
  function vistaReglas() {
    const R = window.REGLAS;
    if (!R) return '<p class="empty">Reglas no disponibles.</p>';
    let h = "<h1>Reglas</h1>" + '<p class="sub">Reglamento FIPA · en vigor a partir de la ' + esc(R.version) + "</p>";
    h += '<div class="facts">' + R.resumen.map(function (f) {
      return '<div class="fact"><div class="fi">' + f.i + "</div><b>" + esc(f.t) + "</b><span>" + esc(f.d) + "</span></div>";
    }).join("") + "</div>";
    h += '<input class="search" id="buscarReglas" type="search" placeholder="Buscar en las reglas…" autocomplete="off">';
    h += R.secciones.map(function (sec) {
      return '<details class="rsec" id="r-' + sec.id + '"><summary><span>' + sec.icono + '</span><span><span class="rn">' + sec.n + ".</span> " + esc(sec.titulo) + "</span></summary>" +
        '<div class="rbody">' + sec.grupos.map(function (g) {
          return (g.titulo ? '<div class="rgrp">' + esc(g.titulo) + "</div>" : "") + g.items.map(function (it) {
            let b = "<div>" + resaltarImportes(it.t) + "</div>";
            if (it.lista) b += "<ol>" + it.lista.map(function (x) { return "<li>" + resaltarImportes(x) + "</li>"; }).join("") + "</ol>";
            if (it.tabla) {
              b += '<div class="rtab-wrap"><table class="rtab"><thead><tr>' + it.tabla.cab.filter(function (c, i) { return it.tabla.filas.some(function (f) { return f[i]; }); }).map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>" +
                it.tabla.filas.map(function (f) {
                  return "<tr>" + f.filter(function (c, i) { return it.tabla.filas.some(function (x) { return x[i]; }); }).map(function (c) { return "<td>" + resaltarImportes(c) + "</td>"; }).join("") + "</tr>";
                }).join("") + "</tbody></table></div>";
            }
            return '<div class="rule' + (it.aviso ? " aviso" : "") + '"><span class="rk">' + esc(it.k) + '</span><div class="rt">' + b + "</div></div>";
          }).join("");
        }).join("") + "</div></details>";
    }).join("");
    return h;
  }
  function activarBusquedaReglas() {
    const input = document.getElementById("buscarReglas");
    if (!input) return;
    input.addEventListener("input", function () {
      const q = norm(input.value).trim();
      app.querySelectorAll(".rsec").forEach(function (sec) {
        let hay = 0;
        sec.querySelectorAll(".rule").forEach(function (r) {
          const ok = q.length < 2 || norm(r.textContent).indexOf(q) !== -1;
          r.classList.toggle("oculto", !ok);
          if (ok) hay++;
        });
        sec.classList.toggle("oculto", q.length >= 2 && !hay);
        if (q.length >= 2 && hay) sec.open = true;
      });
    });
  }

  // ---------- router ----------
  function render() {
    if (!DATA) return;
    const partes = (location.hash.replace(/^#\/?/, "").replace(/\?.*$/, "") || "clasificacion/1").split("/");
    const tab = partes[0] || "clasificacion";
    const div = partes[1] || DATA.divisiones[0].id;
    tabs.forEach(function (a) { a.classList.toggle("on", a.dataset.tab === (tab === "partido" ? "partidos" : tab)); });
    tabs.forEach(function (a) {
      if (a.dataset.tab !== "bajas" && a.dataset.tab !== "reglas" && a.dataset.tab !== "palmares") a.setAttribute("href", "#/" + a.dataset.tab + "/" + (tab !== "bajas" ? div : DATA.divisiones[0].id));
    });
    let html;
    if (tab === "partido") html = vistaPartido(div, partes[2], partes[3]);
    else if (tab === "partidos") html = vistaPartidos(div, partes[2]);
    else if (tab === "plantillas") html = vistaPlantillas(div, partes[2]);
    else if (tab === "reglas") html = vistaReglas();
    else if (tab === "palmares") html = vistaPalmares();
    else if (tab === "bajas") html = vistaBajas(partes[1] !== "todas");
    else html = vistaClasificacion(div);
    app.innerHTML = html;
    window.scrollTo(0, 0);

    app.querySelectorAll("[data-go]").forEach(function (b) {
      b.addEventListener("click", function () { location.hash = b.dataset.go; });
    });
    const sel = document.getElementById("selJornada");
    if (sel) sel.addEventListener("change", function () { location.hash = "#/partidos/" + div + "/" + sel.value; });
    const chk = document.getElementById("chkTodas");
    if (chk) chk.addEventListener("change", function () { location.hash = chk.checked ? "#/bajas/todas" : "#/bajas"; });
    activarBusqueda();
    activarBusquedaReglas();
  }

  // ---------- datos ----------
  async function cargar() {
    const cfg = window.LIGA_CONFIG || {};
    if (cfg.API_URL) {
      try {
        const r = await fetch(cfg.API_URL + (cfg.API_URL.indexOf("?") === -1 ? "?" : "&") + "api=liga");
        if (r.ok) {
          const j = await r.json();
          if (j && j.divisiones) return j;
        }
      } catch (e) { /* se usa la copia estática */ }
    }
    const r = await fetch("data/liga.json", { cache: "no-cache" });
    if (!r.ok) throw new Error("No se pudieron cargar los datos");
    return r.json();
  }

  window.addEventListener("hashchange", render);
  cargar().then(function (d) {
    DATA = d;
    const f = d.actualizado ? new Date(d.actualizado) : null;
    document.getElementById("actualizado").textContent = f && !isNaN(f)
      ? "Actualizado: " + f.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" }) : "";
    render();
  }).catch(function (e) {
    app.innerHTML = '<p class="error">No se pudieron cargar los datos de la liga. ' + esc(e.message) + "</p>";
  });
})();
