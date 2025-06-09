import { withLoader } from './apiWrapper.js';
import manageHalls from './hallsManager.js';
import configureHalls from './hallConfiguration.js';
import fetchAllData from '../../js/moviesApi.js';
import priceManager from './priceManager.js';
import seancesManager from './seancesManager.js';
import configureTicketSales from './salesControl.js';

export async function renderAdminLayout(title, renderContent) {
  const section = document.createElement('section');
  section.className = 'admin-panel__section';
  section.innerHTML = `
    <div class="admin-panel__section-header">
      <div class="admin-panel__section-title-wrapper">
        <div class="admin-panel__section-title-decor"></div>
        <p class="admin-panel__section-title">${title}</p>
      </div>
      <button class="admin-panel__section-toggle">
        <img
          src="../img/button.png"
          alt="Открыть/закрыть информацию"
          class="admin-panel__section-toggle-icon"
        >
      </button>
    </div>
    <div class="admin-panel__section-content"></div>
  `;

  const toggleBtn = section.querySelector('.admin-panel__section-toggle');
  const content = section.querySelector('.admin-panel__section-content');

  if (typeof renderContent === 'function') {
    const result = await renderContent();
    if (typeof result === 'string') {
      content.innerHTML = result;
    } else if (result instanceof HTMLElement) {
      content.appendChild(result);
    }
  }

  toggleBtn.addEventListener('click', () => {
    content.classList.toggle('hidden');
  });

  return section;
}

export async function renderAdminPanel() {
  const mainContainer = document.querySelector('main');
  mainContainer.innerHTML = '';
  const dashboard = document.createElement('div');
  dashboard.className = 'admin-dashboard';
  const data = await withLoader(() => fetchAllData());
  const halls = data?.halls || [];
  const films = data?.films || [];
  const seances = data?.seances || [];

  // Извлекаем hall_rows, hall_places, hall_config для всех залов
  const hallRows = halls.map(hall => hall.hall_rows || '');
  const hallPlaces = halls.map(hall => hall.hall_places || '');
  const hallConfigs = halls.map(hall => hall.hall_config || []);

  dashboard.appendChild(await renderAdminLayout('управление залами', () => manageHalls(halls)));
  dashboard.appendChild(await renderAdminLayout('конфигурация залов', () => configureHalls(halls, hallRows, hallPlaces, hallConfigs))); 
  dashboard.appendChild(await renderAdminLayout('конфигурация цен', () => priceManager(halls)));
  dashboard.appendChild(await renderAdminLayout('сетка сеансов', () => seancesManager(films, halls, seances)));
  dashboard.appendChild(await renderAdminLayout('открыть продажи', () => configureTicketSales(halls)))

  mainContainer.appendChild(dashboard);
  setTimeout(() => {
    const adminPanelSection = document.querySelectorAll('.admin-panel__section');
    adminPanelSection.forEach((el, index) => {
      if (index === adminPanelSection.length - 1) {
        el.classList.add('active');
      }
    });
  }, 0);

  // Восстанавливаем скролл, если есть scrollPosition
  const scrollPosition = localStorage.getItem('scrollPosition');
  console.log('Проверка восстановления скролла, scrollPosition:', scrollPosition);
  if (scrollPosition) {
    window.scrollTo(0, parseInt(scrollPosition));
    console.log('Скролл восстановлен на:', parseInt(scrollPosition));
    localStorage.removeItem('scrollPosition');
  }

  return dashboard;
}