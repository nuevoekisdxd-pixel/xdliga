fetch('equipos.json')
  .then(response => response.json())
  .then(equipos => {
    const contenedor = document.getElementById('contenedor-equipos');
    
    equipos.forEach(equipo => {
      const tarjeta = document.createElement('article');
      tarjeta.className = 'tarjeta-equipo-resumen';
      tarjeta.setAttribute('data-id', equipo.id);
      
      // 1. Si está extinto solo muestra "Extinto", si no, muestra "División: [Nombre]"
      const divisionTexto = equipo.extinto === 1 
        ? '<span class="etiqueta-extinto">Extinto</span>' 
        : `División: ${equipo.division}`;
      
      // 2. Botón o etiqueta de disuelto
      const botonFicha = equipo.extinto === 1 
        ? '<span class="boton-deshabilitado">Club Disuelto</span>' 
        : `<a href="detalle.html?id=${equipo.id}" class="boton-ver">Ver Ficha Completa</a>`;
      
      tarjeta.innerHTML = `
        <img src="logos/${equipo.logo}" alt="Logo" class="logo-pequeno">
        <div class="info-resumen">
            <h2>${equipo.nombre}</h2>
            <p>${divisionTexto}</p> 
        </div>
        ${botonFicha}
      `;
      
      contenedor.appendChild(tarjeta);
    });
  });