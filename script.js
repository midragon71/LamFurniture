// script.js - Lógica Principal (Splash y Carrusel Infinito)

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
const CLONES_COUNT = 2; // Cantidad de clones a cada lado

// --- 1. SETUP INICIAL ---
function setupInfiniteCarousel() {
  if(!imageContainer) return; // Protección si no estamos en index

  imageContainer.innerHTML = '';
  infoContainer.innerHTML = '';

  // Crear clones
  const endImageClones = originalImageItems.slice(-CLONES_COUNT).map(el => el.cloneNode(true));
  const endInfoClones = originalInfoItems.slice(-CLONES_COUNT).map(el => el.cloneNode(true));
  const startImageClones = originalImageItems.slice(0, CLONES_COUNT).map(el => el.cloneNode(true));
  const startInfoClones = originalInfoItems.slice(0, CLONES_COUNT).map(el => el.cloneNode(true));

  // Insertar en orden: [ClonesFin] [Originales] [ClonesInicio]
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

// --- 2. MOVIMIENTO Y ANIMACIÓN ---
function updateCarousel(animate = true) {
  if(!imageContainer) return;
  
  if (animate) {
    const transitionStyle = `transform ${TRANSITION_MS}ms cubic-bezier(0.25, 1, 0.5, 1)`;
    imageContainer.style.transition = transitionStyle;
    infoContainer.style.transition = transitionStyle;
  } else {
    imageContainer.style.transition = 'none';
    infoContainer.style.transition = 'none';
    void imageContainer.offsetWidth; // Forzar Reflow
    void infoContainer.offsetWidth;
  }

  allImageItems.forEach((el, i) => el.classList.toggle('active', i === current));
  allInfoItems.forEach((el, i) => el.classList.toggle('active', i === current));

  centerItem(imageViewport, imageContainer, allImageItems, current);
  centerItem(infoViewport, infoContainer, allInfoItems, current);
}

function centerItem(viewport, container, items, index) {
  const active = items[index];
  if (!active) return;
  const viewportWidth = viewport.clientWidth;
  const activeWidth = active.clientWidth;
  const itemLeft = active.offsetLeft; 
  const target = itemLeft - (viewportWidth / 2 - activeWidth / 2);
  container.style.transform = `translateX(${-target}px)`;
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
  setupInfiniteCarousel();
  setupNavButtons();
  setupAutoplay();
  window.addEventListener('resize', () => { updateCarousel(false); });
}

document.addEventListener('DOMContentLoaded', () => {
  runSplashSequenceOnce();
});