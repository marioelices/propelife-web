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
      DIAS[fecha.getUTCDay()] + " " + (+m[3]) + " de " + MESES[+m[2] - 1] + " de " + m[1] + (pasada ? " (vencida)" : "") + "</div>" +
      "<div>Los mánagers deben ponerse en contacto para jugar al menos 24 h antes del fin de la jornada.</div></div>";
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
      return '<div class="mwrap"><div class="match"><div class="t r"><span>' + esc(loc) + "</span>" + crest(loc, p.localClave) + "</div>" +
        (p.jugado ? '<div class="score">' + p.golesLocal + " - " + p.golesVisitante + "</div>" : '<div class="score pend">vs</div>') +
        '<div class="t">' + crest(vis, p.visitanteClave) + "<span>" + esc(vis) + "</span></div></div>" +
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

  // ---------- router ----------
  function render() {
    if (!DATA) return;
    const partes = (location.hash.replace(/^#\/?/, "") || "clasificacion/1").split("/");
    const tab = partes[0] || "clasificacion";
    const div = partes[1] || DATA.divisiones[0].id;
    tabs.forEach(function (a) { a.classList.toggle("on", a.dataset.tab === tab); });
    tabs.forEach(function (a) {
      if (a.dataset.tab !== "bajas") a.setAttribute("href", "#/" + a.dataset.tab + "/" + (tab !== "bajas" ? div : DATA.divisiones[0].id));
    });
    let html;
    if (tab === "partidos") html = vistaPartidos(div, partes[2]);
    else if (tab === "plantillas") html = vistaPlantillas(div, partes[2]);
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
