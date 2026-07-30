Promise.all([
  fetch('equipos.json').then(res => res.json()),
  fetch('partidos.json').then(res => res.json())
])
.then(([equipos, partidos]) => {
  const cuerpoTabla = document.getElementById('cuerpo-tabla');

  // 1. Crear un mapa/diccionario para acumular las estadísticas de cada equipo desde cero
  const tabla = {};
  
  equipos.forEach(equipo => {
    tabla[equipo.id] = {
      equipoId: equipo.id,
      nombre: equipo.nombre,
      logo: equipo.logo,
      pj: 0, pg: 0, pe: 0, pp: 0,
      gf: 0, gc: 0, dg: 0, puntos: 0
    };
  });

  // 2. Procesar cada partido del historial para calcular los números
  partidos.forEach(partido => {
    const local = tabla[partido.local.id];
    const visitante = tabla[partido.visitante.id];

    // Nos aseguramos de que ambos equipos existan en nuestra estructura
    if (!local || !visitante) return;

    const golesLocal = partido.local.goles;
    const golesVisitante = partido.visitante.goles;

    // Acumular partidos jugados (PJ) y goles (GF y GC)
    local.pj += 1;
    visitante.pj += 1;
    
    local.gf += golesLocal;
    local.gc += golesVisitante;
    
    visitante.gf += golesVisitante;
    visitante.gc += golesLocal;

    // Determinar el resultado de los 90/120 minutos (ignorando la tanda de penales)
    if (golesLocal > golesVisitante) {
      local.pg += 1;
      local.puntos += 3;
      
      visitante.pp += 1;
    } else if (golesVisitante > golesLocal) {
      visitante.pg += 1;
      visitante.puntos += 3;
      
      local.pp += 1;
    } else {
      // Empate (independientemente de si luego hubo penales en una copa)
      local.pe += 1;
      local.puntos += 1;
      
      visitante.pe += 1;
      visitante.puntos += 1;
    }
  });

  // 3. Convertir el mapa a un array y calcular la Diferencia de Goles (DG)
  const listaEstadisticas = Object.values(tabla);
  listaEstadisticas.forEach(club => {
    club.dg = club.gf - club.gc;
  });

  // 4. Aplicar tus criterios estrictos de desempate
  listaEstadisticas.sort((a, b) => {
    // Criterio 1: Mayor cantidad de puntos
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    // Criterio 2: Mayor diferencia de gol (DG)
    if (b.dg !== a.dg) return b.dg - a.dg;
    // Criterio 3: Más goles a favor (GF)
    return b.gf - a.gf;
  });

  // 5. Renderizar las filas ordenadas en el HTML
  listaEstadisticas.forEach((fila, indice) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="posicion">${indice + 1}</td>
      <td class="alinear-izquierda columna-equipo">
          <img src="logos/${fila.logo}" alt="Logo" class="logo-tabla">
          <span>${fila.nombre}</span>
      </td>
      <td>${fila.pj}</td>
      <td>${fila.pg}</td>
      <td>${fila.pe}</td>
      <td>${fila.pp}</td>
      <td>${fila.gf}</td>
      <td>${fila.gc}</td>
      <td class="${fila.dg > 0 ? 'dg-positiva' : fila.dg < 0 ? 'dg-negativa' : ''}">
          ${fila.dg > 0 ? '+' + fila.dg : fila.dg}
      </td>
      <td class="puntos-destacados">${fila.puntos}</td>
    `;
    cuerpoTabla.appendChild(tr);
  });
})
.catch(error => console.error("Error al generar la tabla automática:", error));