import renderLoginForm from './AuthAdmin.js';
import { renderAdminLayout, renderAdminPanel } from './renderAdminDashboard.js';
import { renderAddHallPopup, renderAddMoviePopup, renderAddSeancePopup } from './adminPopup.js';

const logoContainer = document.querySelector('.logo');
if (logoContainer) logoContainer.onclick = () => (window.location.href = '../');

async function router() {
  const hash = window.location.hash;
  const mainContainer = document.querySelector('main');
  const header = document.querySelector('.header');
  if (!mainContainer) return;

  // По умолчанию показываем хедер
  if (header) header.style.display = 'block';
  mainContainer.innerHTML = '';

  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (hash === '' || hash === '#/') {
    renderLoginForm(mainContainer);
  } else if (hash === '#admin-dashboard' && isAuthenticated) {
    const panel = await renderAdminPanel(); // Ожидаем renderAdminPanel
    mainContainer.appendChild(panel); // Убедимся, что panel добавляется в DOM
  } else if (hash === '#add-hall' && isAuthenticated) {
    if (header) header.style.display = 'none';
    mainContainer.appendChild(await renderAddHallPopup()); // Ожидаем renderAddHallPopup
  } else if (hash === '#add-movie' && isAuthenticated) {
    if (header) header.style.display = 'none';
    mainContainer.appendChild(await renderAddMoviePopup());
  } else if (hash === '#add-seance' && isAuthenticated) {
    if (header) header.style.display = 'none';
    mainContainer.appendChild(await renderAddSeancePopup());
  } else {
    window.location.hash = '';
    renderLoginForm(mainContainer);
  }
}

router();
window.addEventListener('hashchange', async () => await router());