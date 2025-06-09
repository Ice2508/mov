

import fetchAllData from '../../js/moviesApi.js';
import { renderAddHallPopup } from './adminPopup.js';
import { deleteHall } from './hallsManagerApi.js';
import { withLoader } from './apiWrapper.js';
import { renderAdminPanel } from './renderAdminDashboard.js'

async function manageHalls(halls) {
  const wrapper = document.createElement('section');
  const hallsList = halls.length > 0 
    ? halls.map(hall => `
       <div class="admin-halls">
        <p>- ${hall.hall_name}</p>
        <div class="admin-halls__delete" data-id="${hall.id}">
            <img src="/img/hall.png">
        </div>    
      </div>
    `).join('')
    : ' <p>Нет доступных залов</p>';

  

  wrapper.innerHTML = `
    <p>Доступные залы:</p>
    <div>${hallsList}</div>
    <button class="admin__btn">Создать зал</button>
  `;

  const createButton = wrapper.querySelector('.admin__btn');
  createButton.addEventListener('click', () => {
    window.location.hash = '#add-hall';
  });


const adminHallsDelite = wrapper.querySelectorAll('.admin-halls__delete');
adminHallsDelite.forEach(hallDelite => {
  hallDelite.addEventListener('click', async (e) => {
    const hallId = e.currentTarget.dataset.id;
    await withLoader(() => deleteHall(hallId));
    const freshData = await fetchAllData(); 
    const updatedWrapper = await manageHalls(freshData.halls || []);
    wrapper.replaceWith(updatedWrapper);
    await renderAdminPanel()
  })
})

return wrapper;
}

export default manageHalls;