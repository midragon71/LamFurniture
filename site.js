// site.js - resalta el enlace activo en la navegación
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.menu a');
  links.forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (href === path || (href === 'index.html' && path === '')) {
      a.setAttribute('aria-current', 'page');
      a.classList.add('active-nav');
    } else {
      a.removeAttribute('aria-current');
      a.classList.remove('active-nav');
    }
  });

  // Hacer que el logo sea foco accesible (opcional: tecla Enter)
  const logoLink = document.querySelector('.logo a');
  if (logoLink) {
    logoLink.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.href = logoLink.href;
      }
    });
  }
});