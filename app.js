// Memoria volátil global
let todosLosEquipos = [];
let todosLosPartidos = [];

Promise.all([
  fetch('equipos.json').then(res => res.json()),
  fetch('partidos.json').then(res => res.json())
])
.then(([equipos, partidos]) => {
  todosLosEquipos = equipos;
  todosLosPartidos = partidos;

  // 1. Configurar selectores y eventos del Historial General
  document.getElementById('filtro-orden').addEventListener('change', mostrarHistorialGeneral);
  document.getElementById('filtro-limite').addEventListener('change', mostrarHistorialGeneral);

  // 2. Poblar selectores de equipos
  poblarSelectores();

  // 3. Configurar eventos del Historial por Equipo
  document.getElementById('selector-club-propio').addEventListener('change', mostrarHistorialPropio);
  document.getElementById('filtro-orden-propio').addEventListener('change', mostrarHistorialPropio);
  document.getElementById('filtro-limite-propio').addEventListener('change', mostrarHistorialPropio);

  // 4. Configurar eventos de Cara a Cara (H2H)
  document.getElementById('selector-h2h-A').addEventListener('change', manejarCambioH2H);
  document.getElementById('selector-h2h-B').addEventListener('change', manejarCambioH2H);
  document.getElementById('filtro-orden-h2h').addEventListener('change', mostrarHistorialH2H);
  document.getElementById('filtro-limite-h2h').addEventListener('change', mostrarHistorialH2H);

  // Carga inicial de la primera sección
  mostrarHistorialGeneral();
})
.catch(error => console.error("Error cargando los datos del historial:", error));

// --- POBLAR SELECTORES ---
function poblarSelectores() {
    const sPropio = document.getElementById('selector-club-propio');
    const sA = document.getElementById('selector-h2h-A');
    const sB = document.getElementById('selector-h2h-B');

    todosLosEquipos.forEach(e => {
        const opt1 = new Option(e.nombre, e.id);
        const opt2 = new Option(e.nombre, e.id);
        const opt3 = new Option(e.nombre, e.id);
        sPropio.add(opt1);
        sA.add(opt2);
        sB.add(opt3);
    });
}

// ========================================================
// MÓDULO 1: HISTORIAL GENERAL
// ========================================================
function mostrarHistorialGeneral() {
  const contenedor = document.getElementById('contenedor-partidos');
  const orden = document.getElementById('filtro-orden').value;
  const limite = document.getElementById('filtro-limite').value;

  let partidos = procesarLista([...todosLosPartidos], orden, limite);
  contenedor.innerHTML = '';
  partidos.forEach(p => dibujarTarjetaPartido(p, contenedor));
}

// ========================================================
// MÓDULO 2: HISTORIAL POR EQUIPO
// ========================================================
function mostrarHistorialPropio() {
  const contenedor = document.getElementById('contenedor-partidos-propio');
  const clubId = document.getElementById('selector-club-propio').value;
  const orden = document.getElementById('filtro-orden-propio').value;
  const limite = document.getElementById('filtro-limite-propio').value;

  contenedor.innerHTML = '';
  if (!clubId) return;

  let filtrados = todosLosPartidos.filter(p => p.local.id === clubId || p.visitante.id === clubId);
  let partidos = procesarLista(filtrados, orden, limite);

  if (partidos.length === 0) {
    contenedor.innerHTML = '<p class="sin-partidos">Este club no registra partidos.</p>';
    return;
  }
  partidos.forEach(p => dibujarTarjetaPartido(p, contenedor, clubId));
}

// ========================================================
// MÓDULO 3: HISTORIAL FRENTE A FRENTE (H2H)
// ========================================================
function manejarCambioRival() {} // Deprecado, integrado abajo
function manejarCambioH2H() {
    const idA = document.getElementById('selector-h2h-A').value;
    const idB = document.getElementById('selector-h2h-B').value;
    const panelStats = document.getElementById('estadisticas-h2h');

    if (!idA || !idB || idA === idB) {
        panelStats.style.display = 'none';
        document.getElementById('contenedor-partidos-h2h').innerHTML = '';
        return;
    }

    // Filtrar enfrentamientos cruzados directos
    let partidosH2H = todosLosPartidos.filter(p => 
        (p.local.id === idA && p.visitante.id === idB) || (p.local.id === idB && p.visitante.id === idA)
    );

    // Calcular estadísticas H2H tomando como base al Equipo A
    let pj = 0, pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    partidosH2H.forEach(p => {
        pj += 1;
        const esLocalA = p.local.id === idA;
        if (esLocalA) {
            gf += p.local.goles; gc += p.visitante.goles;
            if (p.local.goles > p.visitante.goles) pg += 1;
            else if (p.local.goles < p.visitante.goles) pp += 1;
            else pe += 1;
        } else {
            gf += p.visitante.goles; gc += p.local.goles;
            if (p.visitante.goles > p.local.goles) pg += 1;
            else if (p.visitante.goles < p.local.goles) pp += 1;
            else pe += 1;
        }
    });

    panelStats.innerHTML = `
        <h3>Balance Histórico (Perspectiva de ${todosLosEquipos.find(e=>e.id===idA).nombre})</h3>
        <div class="tarjeta-rendimiento-grid">
            <div class="item-metrica"><strong>PJ</strong><span>${pj}</span><label>Jugados</label></div>
            <div class="item-metrica"><strong>PG</strong><span>${pg}</span><label>Ganados</label></div>
            <div class="item-metrica"><strong>PE</strong><span>${pe}</span><label>Empatados</label></div>
            <div class="item-metrica"><strong>PP</strong><span>${pp}</span><label>Perdidos</label></div>
            <div class="item-metrica"><strong>GF</strong><span>${gf}</span><label>A Favor</label></div>
            <div class="item-metrica"><strong>GC</strong><span>${gc}</span><label>En Contra</label></div>
            <div class="item-metrica"><strong>DG</strong><span>${gf - gc}</span><label>Diferencia</label></div>
        </div>
    `;
    panelStats.style.display = 'block';
    mostrarHistorialH2H();
}

function mostrarHistorialH2H() {
    const contenedor = document.getElementById('contenedor-partidos-h2h');
    const idA = document.getElementById('selector-h2h-A').value;
    const idB = document.getElementById('selector-h2h-B').value;
    const orden = document.getElementById('filtro-orden-h2h').value;
    const limite = document.getElementById('filtro-limite-h2h').value;

    contenedor.innerHTML = '';
    if (!idA || !idB || idA === idB) return;

    let filtrados = todosLosPartidos.filter(p => 
        (p.local.id === idA && p.visitante.id === idB) || (p.local.id === idB && p.visitante.id === idA)
    );
    let partidos = procesarLista(filtrados, orden, limite);

    if (partidos.length === 0) {
        contenedor.innerHTML = '<p class="sin-partidos">No hay enfrentamientos registrados.</p>';
        return;
    }
    partidos.forEach(p => dibujarTarjetaPartido(p, contenedor, idA));
}

// --- FUNCIONES AUXILIARES GENERALES ---
function procesarLista(lista, orden, limite) {
    lista.sort((a, b) => {
        const [dA, mA, aA] = a.fecha.split('/');
        const [dB, mB, aB] = b.fecha.split('/');
        return orden === 'recientes' ? new Date(aB, mB-1, dB) - new Date(aA, mA-1, dA) : new Date(aA, mA-1, dA) - new Date(aB, mB-1, dB);
    });
    if (limite !== 'todos') lista = lista.slice(0, parseInt(limite, 10));
    return lista;
}

function dibujarTarjetaPartido(partido, contenedorDestino, enfoqueId = null) {
    const local = todosLosEquipos.find(e => e.id === partido.local.id);
    const visitante = todosLosEquipos.find(e => e.id === partido.visitante.id);

    let bloquePenales = partido.penales ? `
      <div class="tanda-penales-bloque">
          <span class="etiqueta-penales">Definición por penales</span>
          <div class="resultado-penales">
              <span class="penales-local">(${partido.local.penalesAnotados})</span>
              <span class="penales-separador">p.</span>
              <span class="penales-visitante">(${partido.visitante.penalesAnotados})</span>
          </div>
      </div>` : '';

    const tarjeta = document.createElement('article');
    tarjeta.className = 'partido-tarjeta';

    if (enfoqueId) {
        if (partido.local.goles === partido.visitante.goles) tarjeta.classList.add('partido-empate');
        else {
            const ganoLocal = partido.local.goles > partido.visitante.goles;
            const esElLocal = partido.local.id === enfoqueId;
            tarjeta.classList.add((ganoLocal && esElLocal) || (!ganoLocal && !esElLocal) ? 'partido-ganado' : 'partido-perdido');
        }
    }

    tarjeta.innerHTML = `
      <div class="partido-info-superior">
          <span class="temporada">${partido.temporada}</span>
          <span class="competicion">${partido.competicion}</span>
          <span class="fecha">Fecha: ${partido.fecha}</span>
      </div>
      <div class="marcador-bloque">
          <div class="equipo-marcador local"><img src="logos/${local?local.logo:'defecto.png'}" class="logo-partido"><span>${local?local.nombre:'???'}</span></div>
          <div class="resultado-numeros"><span>${partido.local.goles}</span><span class="separador">-</span><span>${partido.visitante.goles}</span></div>
          <div class="equipo-marcador visitante"><span>${visitante?visitante.nombre:'???'}</span><img src="logos/${visitante?visitante.logo:'defecto.png'}" class="logo-partido"></div>
      </div>
      ${bloquePenales}
    `;
    contenedorDestino.appendChild(tarjeta);
}