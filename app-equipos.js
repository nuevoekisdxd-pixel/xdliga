fetch('equipos.json')
  .then(response => response.json())
  .then(equipos => {
    const contenedor = document.getElementById('contenedor-equipos');
    
    equipos.forEach(equipo => {
      const tarjeta = document.createElement('article');
      tarjeta.className = 'tarjeta-equipo-resumen';
      tarjeta.setAttribute('data-id', equipo.id); // Mantiene el ID oculto internamente
      
      tarjeta.innerHTML = `
        <img src="logos/${equipo.logo}" alt="Logo" class="logo-pequeno">
        <div class="info-resumen">
            <h2>${equipo.nombre}</h2>
            <p>División: ${equipo.division}</p>
        </div>
        <!-- Enviamos el ID como parámetro a una única página de detalle -->
        <a href="detalle.html?id=${equipo.id}" class="boton-ver">Ver Ficha Completa</a>
      `;
      
      contenedor.appendChild(tarjeta);
    });
  });