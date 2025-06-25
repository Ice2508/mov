import { createHallTabs } from './hallTabs.js';
import { setHallStatus } from './setHallStatuApi.js';
import { withLoader } from './apiWrapper.js';

export default function configureTicketSales(halls) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('ticket-sales-config');

  let activeHallIndex = 0;
  let activeHall = halls[activeHallIndex] || null;

  let hallTabs = createHallTabs(halls, activeHallIndex, (newIndex, newHall) => {
    activeHallIndex = newIndex;
    activeHall = newHall;
    updateButtonText(statusButton, newHall.hall_open);
  }, 'Выберите зал для открытия/закрытия продаж:');

  wrapper.appendChild(hallTabs);

  const text = document.createElement('p');
  text.classList.add('ticket-sales-config__text');
  text.textContent = 'Все готово к открытию';
  wrapper.appendChild(text);

  const statusButton = document.createElement('button');
  statusButton.classList.add('admin__btn', 'popup__button--save', 'ticket-sales-config__button');
  statusButton.textContent = activeHall?.hall_open ? 'Приостановить продажу билетов' : 'Открыть продажу билетов';
  wrapper.appendChild(statusButton);

  function updateButtonText(button, hallOpen) {
    button.textContent = hallOpen ? 'Приостановить продажу билетов' : 'Открыть продажу билетов';
  }

  statusButton.addEventListener('click', async () => {
    if (!activeHall) return;

    const newStatus = statusButton.textContent === 'Открыть продажу билетов' ? 1 : 0;
    try {
      const updatedHall = await withLoader(() => setHallStatus(activeHall.id, newStatus));
      activeHall = updatedHall;
      halls[activeHallIndex] = updatedHall;

      updateButtonText(statusButton, updatedHall.hall_open);

      const newHallTabs = createHallTabs(halls, activeHallIndex, (newIndex, newHall) => {
        activeHallIndex = newIndex;
        activeHall = newHall;
        updateButtonText(statusButton, newHall.hall_open);
      }, 'Выберите зал для открытия/закрытия продаж:');

      wrapper.replaceChild(newHallTabs, hallTabs);
      hallTabs = newHallTabs;
    } catch (error) {
      console.error('Ошибка при изменении статуса зала:', error);
      alert(`Не удалось изменить статус зала: ${error.message}`);
    }
  });

  return wrapper;
}