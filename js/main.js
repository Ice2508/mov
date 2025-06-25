import loadDataAndUse from './renderFilms.js';
import { renderWeek, calendarClick } from './calendar.js';
import { renderSeancePage } from './renderSeance.js';
import { renderBookingPage } from './renderBooking.js'; 

const headerContainerImg = document.querySelector('.header__img');
headerContainerImg.onclick = () => {
  window.location.hash = '';
}

function router() {
  const hash = window.location.hash;
  const mainContainer = document.getElementById('main');
  const calendarContainer = document.querySelector('.nav');
  const loginBtn = document.querySelector('.header__btn');
  
  mainContainer.innerHTML = '';
   
  if (hash === '' || hash === '#/') {
    if (calendarContainer) {
      calendarContainer.style.display = 'block';
      loginBtn.style.display = 'inline-block';
    }
    localStorage.removeItem('date');
    localStorage.removeItem('bookingCompleted');
    localStorage.removeItem('qrData');
    localStorage.removeItem('bookingSeanceId');
    localStorage.removeItem('movieInfo');
    localStorage.removeItem('selectedSeats');
    renderWeek('calendar');
    loadDataAndUse();
    calendarClick();
  } else if (hash.startsWith('#seance=')) {
    if (calendarContainer) {
      calendarContainer.style.display = 'none';
      loginBtn.style.display = 'none';
    }
    localStorage.removeItem('bookingCompleted');
    localStorage.removeItem('qrData');
    localStorage.removeItem('bookingSeanceId');
    const seanceId = hash.split('=')[1];
    renderSeancePage(seanceId);
  } else if (hash.startsWith('#booking')) {
    if (calendarContainer) {
      calendarContainer.style.display = 'none';
      loginBtn.style.display = 'none';
    }
    const seanceId = hash.split('=')[1];
    renderBookingPage(seanceId);
  }
}

router();
window.addEventListener('hashchange', router);