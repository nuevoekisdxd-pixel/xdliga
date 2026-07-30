// Cargamos ambos archivos JSON en paralelo
Promise.all([
  fetch('equipos.json').then(res => res.json()),
  fetch('partidos.json').then(res => res.json())
])
.then(([equipos, partidos]) => {
  const contenedor = document.getElementById('contenedor-partidos');
  
  partidos.forEach(partido => {
    // BUSCADOR: Encontramos los datos completos del club usando su ID
    const datosLocal = equipos.find(e => e.id === partido.local.id);
    const datosVisitante = equipos.find(e => e.id === partido.visitante.id);

    // Si por algún error un equipo no existe en equipos.json, ponemos datos por defecto
    const nombreLocal = datosLocal ? datosLocal.nombre : "Equipo Desconocido";
    const logoLocal = datosLocal ? datosLocal.logo : "defecto.png";
    
    const nombreVisitante = datosVisitante ? datosVisitante.nombre : "Equipo Desconocido";
    const logoVisitante = datosVisitante ? datosVisitante.logo : "defecto.png";

    // Lógica condicional para los penales
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

    // Creamos la tarjeta insertando las variables combinadas
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
})
.catch(error => console.error("Error cargando los datos del historial:", error));