import fetchAllData from './moviesApi.js';
import fetchHallConfig from './hallConfigApi.js';
import { getSelectedDate } from './calendar.js';
import { withLoader } from '../admin/js/apiWrapper.js';

export const selectedSeats = [];
export const movieInfo = {
  filmName: '',
  seanceTime: '',
  hallName: '',
  rowsLength: '',
};

export async function renderSeancePage(seanceId) {
  const { halls, films, seances } = await withLoader(() => fetchAllData());
  const mainContainer = document.getElementById('main');
  
  const date = JSON.parse(localStorage.getItem('date')) || getSelectedDate();
  
  const hallConfigData = await fetchHallConfig(seanceId, date);
  const hallConfig = hallConfigData.result;

  const seance = seances.find(s => s.id === parseInt(seanceId));
  const film = films.find(f => f.id === seance.seance_filmid);
  const hall = halls.find(h => h.id === seance.seance_hallid);
  
  let rowsHtml = '';
  for (let i = 0; i < hallConfig.length; i++) {
    let seatsHtml = '';
    let seatNumber = 1;
    for (let j = 0; j < hallConfig[i].length; j++) {
      if (hallConfig[i][j] === 'standart') {
        seatsHtml += `<div class="seance__seat seance__ticket_free" data-row="${i + 1}" data-place="${seatNumber}" data-price="${hall.hall_price_standart}"></div>`;
      }
      if (hallConfig[i][j] === 'vip') {
        seatsHtml += `<div class="seance__seat seance__ticket_free-vip" data-row="${i + 1}" data-place="${seatNumber}" data-price="${hall.hall_price_vip}"></div>`;
      }
      if (hallConfig[i][j] === 'disabled') {
        seatsHtml += `<div class="seance__seat seance__ticket_disabled"></div>`;
      }
      if (hallConfig[i][j] === 'taken') {
        seatsHtml += `<div class="seance__seat seance__ticket_occupied"></div>`;
      }
      seatNumber++;
    }
    rowsHtml += `<div class="seance__row">${seatsHtml}</div>`;
  }
  
  movieInfo.filmName = film.film_name;
  movieInfo.seanceTime = seance.seance_time;
  movieInfo.hallName = hall.hall_name;
  movieInfo.rowsLength = hallConfig[0].length;
  selectedSeats.length = 0;

  mainContainer.innerHTML = `
    <section class="seance">
      <div class="seance__header">
        <div class="seance__header-content">
          <h2 class="seance__header-title">${film.film_name}</h2>
          <p class="seance__header-time">Начало сеанса: ${seance.seance_time}</p>
          <p>${hall.hall_name}</p>
        </div>
        <div class="seance__header-zoom">
           <img src="../img/hint.png">
           <div class="seance__header-zoom-text">Тапните дважды, чтобы увеличить</div>
        </div>
      </div>
      <div class="seance__map">
        <div class="seance__map-container">
          <img class="seance__map-image" src="img/movie-screen.png" alt="">
          ${rowsHtml}
          <div class="seance__seat-info">
            <div class="seance__ticket-row">
              <div class="seance__ticket-item">
                <div class="seance__ticket seance__ticket_free"></div>
                <span class="seance__ticket-label">Свободно (${hall.hall_price_standart} руб)</span>
              </div>
              <div class="seance__ticket-item">
                <div class="seance__ticket seance__ticket_free-vip"></div>
                <span class="seance__ticket-label">Свободно VIP (${hall.hall_price_vip} руб)</span>
              </div>
            </div>
            <div class="seance__ticket-row">
              <div class="seance__ticket-item">
                <div class="seance__ticket seance__ticket_occupied"></div>
                <span class="seance__ticket-label">Занято</span>
              </div>
              <div class="seance__ticket-item">
                <div class="seance__ticket seance__ticket_selected"></div>
                <span class="seance__ticket-label">Выбрано</span>
              </div>
            </div>
          </div>
        </div> 
      </div>
      <div class="seance__book-ticket">
        <button class="seance__btn seance__btn-disabled">Забронировать</button>
      </div>
    </section>
    <style>
      .seance.zoomed {
        transform: scale(1.5) translateX(8px);
        transform-origin: top center;
        transition: transform 0.3s ease;
      }
     
    </style>
  `;
  
  const bookBtn = mainContainer.querySelector('.seance__btn');
  bookBtn.addEventListener('click', () => {
    if (selectedSeats.length > 0) {
      localStorage.setItem('movieInfo', JSON.stringify(movieInfo));
      localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
      location.hash = `#booking=${seance.id}`;
    }
  });

  const seats = mainContainer.querySelectorAll('.seance__seat');
  seats.forEach(seat => seat.addEventListener('click', (e) => onSeatClick(e, bookBtn)));

  const zoomHeader = mainContainer.querySelector('.seance__header-zoom');
  const seanceSection = mainContainer.querySelector('.seance');
  let lastTap = 0;
  const doubleTapDelay = 300;

  zoomHeader.addEventListener('touchend', (e) => {
    const currentTime = Date.now();
    if (currentTime - lastTap < doubleTapDelay && currentTime > lastTap) {
      e.preventDefault();
      seanceSection.classList.toggle('zoomed');
      const isZoomed = seanceSection.classList.contains('zoomed');
      document.body.style.backgroundSize = isZoomed ? '150% 150%' : 'cover';
      zoomHeader.querySelector('.seance__header-zoom-text').textContent = 
        isZoomed ? 'Тапните дважды, чтобы уменьшить' : 'Тапните дважды, чтобы увеличить';
    }
    lastTap = currentTime;
  });
}

export function onSeatClick(event, bookBtn) {
  const seat = event.currentTarget;
  const isFree = seat.classList.contains('seance__ticket_free') || seat.classList.contains('seance__ticket_free-vip');
  if (!isFree) return;

  const isSelected = seat.classList.toggle('seance__ticket_selected');
  if (isSelected) {
    selectedSeats.push({
      row: seat.dataset.row,
      place: seat.dataset.place,
      price: seat.dataset.price
    });
  } else {
    const index = selectedSeats.findIndex(s => s.row === seat.dataset.row && s.place === seat.dataset.place);
    if (index !== -1) selectedSeats.splice(index, 1);
  }
  bookBtn.classList.toggle('seance__btn-disabled', selectedSeats.length === 0);
}
