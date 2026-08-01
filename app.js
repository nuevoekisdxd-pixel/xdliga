// Variables globales para mantener los datos en memoria una vez cargados
let datosEquiposGlobal = [];
let datosPartidosGlobal = [];

Promise.all([
  fetch('equipos.json').then(res => res.json()),
  fetch('partidos.json').then(res => res.json())
])
.then(([equipos, partidos]) => {
  datosEquiposGlobal = equipos;
  datosPartidosGlobal = partidos;

  // Escuchar los cambios en los selectores desplegables
  document.getElementById('filtro-orden').addEventListener('change', procesarYMostrarPartidos);
  document.getElementById('filtro-limite').addEventListener('change', procesarYMostrarPartidos);

  // Primera carga inicial de la página
  procesarYMostrarPartidos();
})
.catch(error => console.error("Error cargando los datos del historial:", error));

// Función principal que procesa el orden y límite
function procesarYMostrarPartidos() {
  const contenedor = document.getElementById('contenedor-partidos');
  contenedor.innerHTML = ''; // Limpiamos los partidos anteriores de la pantalla

  // Obtenemos los valores seleccionados por el usuario
  const orden = document.getElementById('filtro-orden').value;
  const limite = document.getElementById('filtro-limite').value;

  // Hacemos una copia de los partidos para no alterar el array original
  let partidosProcesados = [...datosPartidosGlobal];

  // 1. APLICAR ORDENAMIENTO CRONOLÓGICO
  partidosProcesados.sort((a, b) => {
    const [diaA, mesA, anioA] = a.fecha.split('/');
    const [diaB, mesB, anioB] = b.fecha.split('/');
    
    const fechaA = new Date(anioA, mesA - 1, diaA);
    const fechaB = new Date(anioB, mesB - 1, diaB);
    
    if (orden === 'recientes') {
      return fechaB - fechaA; // Nuevos primero
    } else {
      return fechaA - fechaB; // Antiguos primero
    }
  });

  // 2. APLICAR LÍMITE DE CANTIDAD (Paginación simple)
  if (limite !== 'todos') {
    const cantidadACortar = parseInt(limite, 10);
    partidosProcesados = partidosProcesados.slice(0, cantidadACortar);
  }

  // 3. RENDERIZAR EN EL HTML
  partidosProcesados.forEach(partido => {
    const datosLocal = datosEquiposGlobal.find(e => e.id === partido.local.id);
    const datosVisitante = datosEquiposGlobal.find(e => e.id === partido.visitante.id);

    const nombreLocal = datosLocal ? datosLocal.nombre : "Equipo Desconocido";
    const logoLocal = datosLocal ? datosLocal.logo : "defecto.png";
    const nombreVisitante = datosVisitante ? datosVisitante.nombre : "Equipo Desconocido";
    const logoVisitante = datosVisitante ? datosVisitante.logo : "defecto.png";

    let bloquePenales = '';
    if (partido.penales) {
      bloquePenales = `
        <div class="tanda-penales-bloque">
            <span class="etiqueta-penales">Definición por penales</span>
            <div class="resultado-penales">
                <span class="penales-local">(${partido.local.penalesAnotados})</span>
                <span class="penales-separador">p.</span>
                <span class="penales-visitante">(${partido.visitante.penalesAnotados})</span>
            </div>
        </div>`;
    }

    const tarjeta = document.createElement('article');
    tarjeta.className = 'partido-tarjeta';
    tarjeta.setAttribute('data-match-id', partido.id);

    tarjeta.innerHTML = `
      <div class="partido-info-superior">
          <span class="temporada">${partido.temporada}</span>
          <span class="competicion">${partido.competicion}</span>
          <span class="fecha">Fecha: ${partido.fecha}</span>
      </div>
      <div class="marcador-bloque">
          <div class="equipo-marcador local" data-id="${partido.local.id}">
              <img src="logos/${logoLocal}" alt="Logo" class="logo-partido">
              <span class="equipo-nombre">${nombreLocal}</span>
          </div>
          <div class="resultado-numeros">
              <span class="goles-local">${partido.local.goles}</span>
              <span class="separador">-</span>
              <span class="goles-visitante">${partido.visitante.goles}</span>
          </div>
          <div class="equipo-marcador visitante" data-id="${partido.visitante.id}">
              <span class="equipo-nombre">${nombreVisitante}</span>
              <img src="logos/${logoVisitante}" alt="Logo" class="logo-partido">
          </div>
      </div>
      ${bloquePenales}
    `;

    contenedor.appendChild(tarjeta);
  });
}