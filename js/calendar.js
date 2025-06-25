import loadDataAndUse from './renderFilms.js';

let selectedDate = new Date().toISOString().split('T')[0];

export function renderWeek(containerId, offset = 0) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + offset * 6);

  for (let i = 0; i < 6; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const isToday = currentDate.toDateString() === today.toDateString();
    const dow = currentDate.getDay();

    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar__day';
    if (isToday) dayDiv.classList.add('calendar__day--today');

    if (dow === 0 || dow === 6) {
      dayDiv.style.color = 'red';
    }

    const weekday = currentDate.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '');
    const dayNumber = currentDate.getDate();
    const dayName = isToday ? 'Сегодня' : weekday;
    const numberDisplay = isToday ? `${weekday} ${dayNumber}` : `${dayNumber}`;

    dayDiv.innerHTML = `
      <div class="calendar__day-name">${dayName}</div>
      <div class="calendar__day-number">${numberDisplay}</div>
    `;

    dayDiv.dataset.date = currentDate.toISOString().split('T')[0];
    container.appendChild(dayDiv);
  }

  const nextButton = document.createElement('div');
  nextButton.className = 'calendar__day calendar__day--next';
  nextButton.innerHTML = `<div class="calendar__day-name">></div>`;
  nextButton.addEventListener('click', () => {
    renderWeek(containerId, offset + 1);
    calendarClick();
  });
  container.appendChild(nextButton);

  const firstDay = container.querySelector('.calendar__day:not(.calendar__day--next)');
  if (firstDay) {
    firstDay.classList.add('calendar__day--active');
    selectedDate = firstDay.dataset.date;
  }
}

export function calendarClick() {
  const calendarDays = document.querySelectorAll('.calendar__day');
  calendarDays.forEach(day => {
    day.addEventListener('click', () => {
      if (day.classList.contains('calendar__day--next')) return;

      calendarDays.forEach(d => d.classList.remove('calendar__day--active'));
      day.classList.add('calendar__day--active');
      selectedDate = day.dataset.date;
      localStorage.setItem('date', JSON.stringify(selectedDate));
      loadDataAndUse();
    });
  });
}

export function getSelectedDate() {
  return selectedDate;
}