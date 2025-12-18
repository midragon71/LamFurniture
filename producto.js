document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. LÓGICA DE COLORES (Hover + Click) ---
  const colorBtns = document.querySelectorAll('.color-btn');
  const allImages = document.querySelectorAll('.product-img');

  // Función que activa un color específico
  const activateColor = (btn) => {
    // A. Actualizar estilo de los botones (negrita, etc)
    colorBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // B. Mostrar la imagen correspondiente
    const selectedColor = btn.getAttribute('data-color');
    allImages.forEach(img => {
      if (img.getAttribute('data-img-color') === selectedColor) {
        img.classList.add('active');
      } else {
        img.classList.remove('active');
      }
    });
  };

  colorBtns.forEach(btn => {
    // Evento para escritorio: Al pasar el ratón por encima
    btn.addEventListener('mouseenter', () => {
      activateColor(btn);
    });

    // Evento para móvil/tablet: Al tocar
    btn.addEventListener('click', () => {
      activateColor(btn);
    });
  });


  // --- 2. LÓGICA DE INFO (+) ---
  const plusBtn = document.querySelector('.prod-plus-btn');
  const infoOverlay = document.querySelector('.prod-info-overlay');

  if (plusBtn && infoOverlay) {
    plusBtn.addEventListener('click', (e) => {
      e.preventDefault(); 
      // Alternar clases active
      plusBtn.classList.toggle('active');
      infoOverlay.classList.toggle('active');
    });
  }
});