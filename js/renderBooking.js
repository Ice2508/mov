import { buyTickets } from './buyTicketsApi.js'; 
import QRCreator from './QRCreator.js';

export async function renderBookingPage(seanceId) {
  const mainContainer = document.getElementById('main');
  const movieInfo = JSON.parse(localStorage.getItem('movieInfo'));
  const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats'));
  let totalPrice = 0;

  const seatNumbers = selectedSeats.map(seat => {
    totalPrice += +seat.price;
    return ((seat.row - 1) * movieInfo.rowsLength) + Number(seat.place);
  });

  seatNumbers.sort((a, b) => a - b); // Сортировка по возрастанию
  const seatString = seatNumbers.join(', '); // Строка с местами

  // Проверяем, завершено ли бронирование для текущего seanceId
  const isBookingCompleted = localStorage.getItem('bookingCompleted') === 'true' && 
                            localStorage.getItem('bookingSeanceId') === seanceId;
  const savedQrData = localStorage.getItem('qrData');

  mainContainer.innerHTML = `
    <section class="booking">
      <div class="booking__header">
        <h3 class="booking__header-title">Вы выбрали билеты:</h3>
      </div>
      <div class="booking__info">
         <p class="booking__info-text">На фильм: <span>${movieInfo.filmName}</span></p>
         <p class="booking__info-text">${selectedSeats.length > 1 ? 'Места:' : 'Место:'} <span>${seatString}</span></p>
         <p class="booking__info-text">В зале: <span>${movieInfo.hallName}</span></p>
         <p class="booking__info-text">Начало сеанса: <span>${movieInfo.seanceTime}</span></p>
         <p class="booking__info-text">Стоимость: <span>${totalPrice}</span> ${getRublesWord(totalPrice)}</p>
      </div>
      <div class="booking__btn">
        <button class="seance__btn" ${isBookingCompleted ? 'style="display: none;"' : ''}>Получить код бронирования</button>
      </div>
      <div class="booking__footer">
         <div id="qr-code" class="booking__footer-qr"></div>
         <div class="booking__footer-text">
            ${isBookingCompleted ? `
              <p>Покажите QR-код нашему контроллеру для подтверждения бронирования</p>
              <p>Приятного просмотра!</p>
            ` : `
              <p>После оплаты билет будет доступен в этом окне, а также придет
                вам на почту. Покажите QR-код нашему контроллеру у входа в зал.</p>
              <p>Приятного просмотра!</p>
            `}
          </div>  
      </div>
    </section>
   `;
  
  const bookingBtn = document.querySelector('.seance__btn');
  const qrContainer = document.getElementById('qr-code');
  const footerText = document.querySelector('.booking__footer-text');
  let dateToUse = movieInfo.seanceDay;
    if (!dateToUse || dateToUse === 'null') {
    const today = new Date();
    dateToUse = today.toLocaleDateString('ru-RU'); // например: "27.05.2025"
  }
  // Если бронирование завершено, восстанавливаем QR-код
  if (isBookingCompleted && savedQrData) {
    const qr = QRCreator(savedQrData, {
      mode: 4, // Октетный режим (UTF-8)
      eccl: 2, // Уровень коррекции H
      image: 'PNG', // Формат PNG
      modsize: 2, // Размер модуля
      margin: 2 // Отступ
    });
    if (!qr.error) {
      qrContainer.innerHTML = ''; // Очищаем контейнер
      qrContainer.append(qr.result); // Добавляем QR-код
    }
  }

  // Обработчик для кнопки, если она есть
  if (bookingBtn) {
    bookingBtn.addEventListener('click', async () => {
      try {
        const response = await buyTickets();
        console.log(response)
        // Проверяем, является ли ответ массивом билетов
        if (Array.isArray(response) && response.length > 0) {
          bookingBtn.style.display = 'none';
          footerText.innerHTML = `
              <p>Покажите QR-код нашему контроллеру для подтверждения бронирования</p>
              <p>Приятного просмотра!</p>
            `;
          // Данные для QR-кода: строка из данных билетов
          const qrData = response.map(ticket => 
            `${ticket.ticket_filmname}, ${ticket.ticket_hallname}, ${dateToUse}, ${ticket.ticket_time}, Ряд ${ticket.ticket_row} Место ${ticket.ticket_place}`
          ).join('; ');
          // Генерация QR-кода
          const qr = QRCreator(qrData, {
            mode: 4, // Октетный режим (UTF-8)
            eccl: 2, // Уровень коррекции H
            image: 'PNG', // Формат PNG
            modsize: 2, // Размер модуля
            margin: 2 // Отступ
          });
          if (!qr.error) {
            qrContainer.innerHTML = ''; // Очищаем контейнер
            qrContainer.append(qr.result); // Добавляем QR-код
            // Сохраняем состояние бронирования
            localStorage.setItem('bookingCompleted', 'true');
            localStorage.setItem('qrData', qrData);
            localStorage.setItem('bookingSeanceId', seanceId);
          }
        }
      } catch (error) {
        // Ничего не делаем при ошибке
      }
    });
  }
}

function getRublesWord(num) {
  num = Math.abs(num) % 100;
  const lastDigit = num % 10;

  if (num > 10 && num < 20) {
    return 'рублей';
  }
  if (lastDigit === 1) {
    return 'рубль';
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'рубля';
  }
  return 'рублей';
}

export function getSeanceId() {
  const hash = window.location.hash; // Например: "#booking=1910"
  const params = new URLSearchParams(hash.slice(1)); // Удаляем #
  return params.get('booking'); // Вернёт строку "1910"
}