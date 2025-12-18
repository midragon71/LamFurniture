// script.js - Carrusel Infinito (Soporte Vertical Móvil + Horizontal Desktop)

// --- REFERENCIAS DOM ---
const imageViewport = document.querySelector('.viewport.images');
const infoViewport = document.querySelector('.viewport.info');
const imageContainer = document.querySelector('.carrusel-container.images');
const infoContainer = document.querySelector('.carrusel-container.info');

// Guardamos referencia de los elementos originales
let originalImageItems = Array.from(document.querySelectorAll('.carrusel-container.images .item'));
let originalInfoItems = Array.from(document.querySelectorAll('.carrusel-container.info .item'));

// Estado
let allImageItems = [];
let allInfoItems = [];
let current = 0;
let isTransitioning = false;
let autoplay;
const TRANSITION_MS = 600; 
const CLONES_COUNT = 2; 

// --- 1. SETUP INICIAL ---
function setupInfiniteCarousel() {
  if(!imageContainer) return;

  imageContainer.innerHTML = '';
  infoContainer.innerHTML = '';

  // Crear clones
  const endImageClones = originalImageItems.slice(-CLONES_COUNT).map(el => el.cloneNode(true));
  const endInfoClones = originalInfoItems.slice(-CLONES_COUNT).map(el => el.cloneNode(true));
  const startImageClones = originalImageItems.slice(0, CLONES_COUNT).map(el => el.cloneNode(true));
  const startInfoClones = originalInfoItems.slice(0, CLONES_COUNT).map(el => el.cloneNode(true));

  // Insertar
  endImageClones.forEach(el => { el.classList.add('clone'); imageContainer.appendChild(el); });
  originalImageItems.forEach(el => imageContainer.appendChild(el));
  startImageClones.forEach(el => { el.classList.add('clone'); imageContainer.appendChild(el); });

  endInfoClones.forEach(el => { el.classList.add('clone'); infoContainer.appendChild(el); });
  originalInfoItems.forEach(el => infoContainer.appendChild(el));
  startInfoClones.forEach(el => { el.classList.add('clone'); infoContainer.appendChild(el); });

  // Referencias actualizadas
  allImageItems = Array.from(imageContainer.querySelectorAll('.item'));
  allInfoItems = Array.from(infoContainer.querySelectorAll('.item'));

  // Posición inicial
  current = CLONES_COUNT;
  updateCarousel(false);
}

// --- 2. MOVIMIENTO (INTELIGENTE X / Y) ---


function updateCarousel(animate = true) {
  if(!imageContainer) return;
  
  // Seleccionamos todas las imágenes para controlar su transición interna
  const allImages = imageContainer.querySelectorAll('img');

  if (animate) {
    // MOVIMIENTO NORMAL
    const transitionStyle = `transform ${TRANSITION_MS}ms cubic-bezier(0.25, 1, 0.5, 1)`;
    imageContainer.style.transition = transitionStyle;
    infoContainer.style.transition = transitionStyle;
    
    // Reactivamos las transiciones de las imágenes (por si se quedaron apagadas)
    allImages.forEach(img => img.style.transition = '');

  } else {
    // TELETRANSPORTE (RESET SILENCIOSO)
    imageContainer.style.transition = 'none';
    infoContainer.style.transition = 'none';
    
    // --- SOLUCIÓN DEL BOTE ---
    // Apagamos la transición de las imágenes para que el cambio de tamaño (0.9 -> 1.2) sea instantáneo
    allImages.forEach(img => img.style.transition = 'none');
  }

  // Activar clases (esto cambia el tamaño de la imagen)
  allImageItems.forEach((el, i) => el.classList.toggle('active', i === current));
  allInfoItems.forEach((el, i) => el.classList.toggle('active', i === current));

  // Centrar
  centerItem(imageViewport, imageContainer, allImageItems, current);
  centerItem(infoViewport, infoContainer, allInfoItems, current);
  
  // Forzar Reflow (necesario para aplicar los cambios sin transición inmediatamente)
  if (!animate) {
    void imageContainer.offsetWidth; 
    void infoContainer.offsetWidth;
    // Las imágenes ya cambiaron de tamaño instantáneamente gracias al transition='none'
  }
}

function centerItem(viewport, container, items, index) {
  const active = items[index];
  if (!active) return;

  // DETECTAR SI ES MÓVIL (Menos de 768px)
  const isMobile = window.innerWidth <= 480;

  if (isMobile) {
    // --- LÓGICA VERTICAL (Móvil) ---
    const viewportHeight = viewport.clientHeight;
    const activeHeight = active.clientHeight;
    const itemTop = active.offsetTop; 
    
    // Calcular centro vertical
    const target = itemTop - (viewportHeight / 2 - activeHeight / 2);
    container.style.transform = `translateY(${-target}px)`;

  } else {
    // --- LÓGICA HORIZONTAL (Desktop) ---
    const viewportWidth = viewport.clientWidth;
    const activeWidth = active.clientWidth;
    const itemLeft = active.offsetLeft; 
    
    // Calcular centro horizontal
    const target = itemLeft - (viewportWidth / 2 - activeWidth / 2);
    container.style.transform = `translateX(${-target}px)`;
  }
}

// --- 3. NAVEGACIÓN ---
function next() {
  if (isTransitioning) return;
  isTransitioning = true;
  current++;
  updateCarousel(true);
  setTimeout(() => { checkInfinity(); isTransitioning = false; }, TRANSITION_MS + 50);
}

function prev() {
  if (isTransitioning) return;
  isTransitioning = true;
  current--;
  updateCarousel(true);
  setTimeout(() => { checkInfinity(); isTransitioning = false; }, TRANSITION_MS + 50);
}

function checkInfinity() {
  const totalReal = originalImageItems.length;
  let hasTeleported = false;
  
  if (current >= totalReal + CLONES_COUNT) {
    current = CLONES_COUNT;
    hasTeleported = true;
  }
  if (current < CLONES_COUNT) {
    current = totalReal + CLONES_COUNT - 1;
    hasTeleported = true;
  }
  if (hasTeleported) updateCarousel(false);
}

// --- 4. SETUP GENERAL ---
function setupNavButtons() {
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  if (!prevBtn || !nextBtn) return;

  const newPrev = prevBtn.cloneNode(true);
  const newNext = nextBtn.cloneNode(true);
  prevBtn.parentNode.replaceChild(newPrev, prevBtn);
  nextBtn.parentNode.replaceChild(newNext, nextBtn);

  newPrev.addEventListener('click', (e) => { e.preventDefault(); stopAutoplay(); prev(); });
  newNext.addEventListener('click', (e) => { e.preventDefault(); stopAutoplay(); next(); });
}

function setupAutoplay() {
  startAutoplay();
  const zone = document.querySelector('.carrusel');
  if(zone){
    ['mouseenter', 'touchstart'].forEach(e => zone.addEventListener(e, stopAutoplay));
    ['mouseleave', 'touchend'].forEach(e => zone.addEventListener(e, startAutoplay));
  }
}
function startAutoplay() {
  if (autoplay) clearInterval(autoplay);
  autoplay = setInterval(next, 3500);
}
function stopAutoplay() {
  if (autoplay) clearInterval(autoplay);
}

// --- 5. SPLASH E INICIO ---
const splash = document.getElementById('splash');
const slides = splash ? Array.from(document.querySelectorAll('.splash-slide')) : [];

function runSplashSequenceOnce() {
  if (!splash) { initAfterSplash(); return; }
  
  const sessionShown = sessionStorage.getItem('splashShown') === '1';
  if (sessionShown) {
    if (splash.parentNode) splash.parentNode.removeChild(splash);
    initAfterSplash();
    return;
  }

  const loadPromises = slides.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(r => { img.onload = r; img.onerror = r; });
  });

  Promise.all(loadPromises).then(() => {
    let idx = 0;
    const showNext = () => {
      slides.forEach((s, i) => s.classList.toggle('visible', i === idx));
      idx++;
      if (idx < slides.length) setTimeout(showNext, 2000);
      else setTimeout(() => {
        splash.classList.add('splash-hide');
        sessionStorage.setItem('splashShown', '1');
        setTimeout(() => {
          if (splash.parentNode) splash.parentNode.removeChild(splash);
          initAfterSplash();
        }, 800);
      }, 2000);
    };
    showNext();
  });
}

function initAfterSplash() {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  
  if (window.innerWidth <= 480) {
    // MODO MÓVIL: Creamos la vista vertical táctil
    createMobileLayout();
    // Opcional: Detener autoplay del escritorio para ahorrar recursos
    stopAutoplay();
  } else {
    // MODO ESCRITORIO: Tu lógica original
    setupInfiniteCarousel();
    setupNavButtons();
    setupAutoplay();
  }
  
  window.addEventListener('resize', () => { 
    // Recargar si cambiamos drásticamente de tamaño (opcional)
    if(window.innerWidth > 480 && document.getElementById('mobile-carousel-view')) {
      location.reload(); 
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  runSplashSequenceOnce();
});
/* --- AÑADIR AL FINAL DE SCRIPT.JS --- */

// Función para generar la vista móvil fusionada
function createMobileLayout() {
  // Solo ejecutar si es móvil y si no existe ya
  if (window.innerWidth > 480) return;
  if (document.getElementById('mobile-carousel-view')) return;

  // 1. Buscar los elementos originales (limpios, sin clones)
  // Usamos los selectores originales de tu HTML
  const rawImages = document.querySelectorAll('.viewport.images .carrusel-container.images .item:not(.clone) img');
  const rawInfos = document.querySelectorAll('.viewport.info .carrusel-container.info .item:not(.clone)');

  // 2. Crear el contenedor nuevo
  const mobileContainer = document.createElement('div');
  mobileContainer.id = 'mobile-carousel-view';
  
  // 3. Fusionar Imagen + Info en tarjetas
  rawImages.forEach((img, index) => {
    const infoItem = rawInfos[index];
    if(!infoItem) return;

    // Extraer datos del texto
    const num = infoItem.querySelector('.number').innerText;
    const name = infoItem.querySelector('.name').innerText;
    // Nota: El link del "+" original
    const link = infoItem.querySelector('.plus').getAttribute('href');

    // Crear la tarjeta HTML
    const card = document.createElement('div');
    card.className = 'mobile-card';
    card.innerHTML = `
      <a href="${link}">
        <img src="${img.getAttribute('src')}" alt="${name}">
      </a>
      <div class="mobile-info-row">
        <span class="m-num">${num}</span>
        <span class="m-name">${name}</span>
        <a href="${link}" class="m-plus">+</a>
      </div>
    `;
    
    mobileContainer.appendChild(card);
  });

  // 4. Insertar en el DOM (dentro del main, ocultando el carrusel original via CSS)
  const main = document.querySelector('main');
  main.appendChild(mobileContainer);}