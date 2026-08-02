fetch('equipos.json')
  .then(response => response.json())
  .then(equipos => {
    const contenedor = document.getElementById('contenedor-equipos');
    
    equipos.forEach(equipo => {
      const tarjeta = document.createElement('article');
      tarjeta.className = 'tarjeta-equipo-resumen';
      tarjeta.setAttribute('data-id', equipo.id); // Mantiene el ID oculto internamente
      
      // 1. Si está extinto muestra "Extinto", de lo contrario muestra su división
      const divisionTexto = equipo.extinto === 1 ? 'Extinto' : equipo.division;
      
      // 2. Si está extinto no muestra el botón para ir al detalle (o muestra un texto informativo)
      const botonFicha = equipo.extinto === 1 
        ? '<span class="boton-deshabilitado">Club Disuelto</span>' 
        : `<a href="detalle.html?id=${equipo.id}" class="boton-ver">Ver Ficha Completa</a>`;
      
      tarjeta.innerHTML = `
        <img src="logos/${equipo.logo}" alt="Logo" class="logo-pequeno">
        <div class="info-resumen">
            <h2>${equipo.nombre}</h2>
            <p>División: ${divisionTexto}</p>
        </div>
        ${botonFicha}
      `;
      
      contenedor.appendChild(tarjeta);
    });
  });