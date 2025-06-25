import { deleteHall } from './hallsManagerApi.js';
import { withLoader } from './apiWrapper.js';
import { renderAdminPanel } from './renderAdminDashboard.js';

export default async function manageHalls(halls) {
  const wrapper = document.createElement('div');
  const hallsList = halls.length > 0 
    ? halls.map(hall => `
       <li class="admin-halls">
        <p>- ${hall.hall_name}</p>
        <div class="admin-halls__delete" data-id="${hall.id}">
            <img src="/mov/img/hall.png" alt="удаление зала">
        </div>    
      </li>
    `).join('')
    : '<p>Нет доступных залов</p>';

  wrapper.innerHTML = `
    <h3>Доступные залы:</h3>
    <ul class="admin-halls__list">${hallsList}</ul>
    <button class="admin__btn">Создать зал</button>
  `;

  const createButton = wrapper.querySelector('.admin__btn');
  createButton.addEventListener('click', () => {
    window.location.hash = '#add-hall';
  });

  const adminHallsDelete = wrapper.querySelectorAll('.admin-halls__delete');
  adminHallsDelete.forEach(hallDelete => {
    hallDelete.addEventListener('click', async (e) => {
      const hallId = parseInt(e.currentTarget.dataset.id);
      try {
        await withLoader(() => deleteHall(hallId));
        let data = JSON.parse(localStorage.getItem('moviesData')) || { halls: [], films: [], seances: [] };
        if (!Array.isArray(data.halls)) {
          data.halls = [];
        }
        data.halls = data.halls.filter(hall => hall.id !== hallId);
        localStorage.setItem('moviesData', JSON.stringify(data));
        await renderAdminPanel();
      } catch (error) {
        alert('Не удалось удалить зал: ' + error.message);
      }
    });
  });

  return wrapper;
}