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
        <h2 class="admin-panel__section-title">${title}</h2>
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

  let data = JSON.parse(localStorage.getItem('moviesData'));
  if (data === null) {
    data = await withLoader(() => fetchAllData());
    localStorage.setItem('moviesData', JSON.stringify(data));
  }

  const halls = data?.halls || [];
  const films = data?.films || [];
  const seances = data?.seances || [];

  const hallRows = halls.map(hall => hall.hall_rows || '');
  const hallPlaces = halls.map(hall => hall.hall_places || '');
  const hallConfigs = halls.map(hall => hall.hall_config || []);

  dashboard.appendChild(await renderAdminLayout('управление залами', () => manageHalls(halls)));
  dashboard.appendChild(await renderAdminLayout('конфигурация залов', () => configureHalls(halls, hallRows, hallPlaces, hallConfigs))); 
  dashboard.appendChild(await renderAdminLayout('конфигурация цен', () => priceManager(halls)));
  dashboard.appendChild(await renderAdminLayout('сетка сеансов', () => seancesManager(films, halls, seances)));
  dashboard.appendChild(await renderAdminLayout('открыть продажи', () => configureTicketSales(halls)));

  mainContainer.appendChild(dashboard);
  setTimeout(() => {
    const adminPanelSection = document.querySelectorAll('.admin-panel__section');
    adminPanelSection.forEach((el, index) => {
      if (index === adminPanelSection.length - 1) {
        el.classList.add('active');
      }
    });
  }, 0);

  const scrollPosition = localStorage.getItem('scrollPosition');
  if (scrollPosition) {
    window.scrollTo(0, parseInt(scrollPosition));
    localStorage.removeItem('scrollPosition');
  }

  return dashboard;
}

export async function updateSeancesSection() {
  const data = JSON.parse(localStorage.getItem('moviesData')) || {};
  const { films = [], halls = [], seances = [] } = data;

  if (!Array.isArray(films) || !Array.isArray(halls) || !Array.isArray(seances)) {
    console.error('Invalid data in localStorage:', data);
    return;
  }

  const section = document.querySelector('.admin-panel__section:has(.seances-config)');
  if (section) {
    const content = section.querySelector('.admin-panel__section-content');
    content.innerHTML = '';
    content.appendChild(await seancesManager(films, halls, seances));
  }
}