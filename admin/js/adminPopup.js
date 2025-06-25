import { addHall } from './hallsManagerApi.js';
import { withLoader } from './apiWrapper.js';
import { addMovie } from './addDelMoviesApi.js';
import { addSeance, deleteSeance } from './seancesApi.js';
import { renderAdminPanel, updateSeancesSection } from './renderAdminDashboard.js';


function closePopup(popup) {
  if (popup?.parentNode) popup.remove();
  localStorage.removeItem('dragData');
  window.location.hash = '#admin-dashboard';
}

function updateLocalStorageList(key, list) {
  let data = JSON.parse(localStorage.getItem('moviesData')) || { halls: [], films: [], seances: [] };
  if (!Array.isArray(data[key])) data[key] = [];
  data[key] = list;
  localStorage.setItem('moviesData', JSON.stringify(data));
}

export function renderAddHallPopup() {
  const popup = document.createElement('section');
  popup.classList.add('popup');
  popup.innerHTML = `
    <div class="popup__content">
      <div class="popup__title">
        <h3 class="popup__title-text">добавление зала</h3>
        <button type="button" class="popup__close" aria-label="Закрыть попап">×</button>
      </div>
      <div class="popup__form">
        <label for="popup__input" class="popup__label">Название зала</label>
        <input type="text" id="popup__input" class="popup__input" name="hall-name" autocomplete="off">
        <div class="popup__actions">
          <button class="admin__btn admin__btn-disabled popup__button--ok">Добавить зал</button>
          <button class="admin__btn popup__button--cancel">Отмена</button>
        </div>
      </div>
    </div>
  `;

  const closeBtn = popup.querySelector('.popup__close');
  const cancelBtn = popup.querySelector('.popup__button--cancel');
  const addBtn = popup.querySelector('.popup__button--ok');
  const input = popup.querySelector('#popup__input');

  closeBtn.addEventListener('click', () => closePopup(popup));
  cancelBtn.addEventListener('click', () => closePopup(popup));
  input.addEventListener('input', () => {
    addBtn.classList.toggle('admin__btn-disabled', !input.value.trim());
  });
  addBtn.addEventListener('click', async () => {
    const inputValue = input.value.trim();
    if (!inputValue) {
      alert('Введите название зала');
      return;
    }
    try {
      const halls = await withLoader(() => addHall(inputValue));
      if (!halls?.length) {
        alert('Ошибка: сервер не вернул список залов');
        return;
      }
      updateLocalStorageList('halls', halls);
      closePopup(popup);
      await renderAdminPanel();
    } catch (error) {
      alert('Не удалось добавить зал: ' + error.message);
    }
  });

  return popup;
}

export async function renderAddMoviePopup() {
  const popup = document.createElement('section');
  popup.classList.add('popup');
  popup.innerHTML = `
    <div class="popup__content">
      <div class="popup__title">
        <h3 class="popup__title-text">Добавление фильма</h3>
        <button type="button" class="popup__close" aria-label="Закрыть попап">×</button>
      </div>
      <div class="popup__form">
        <div class="popup__form-group">
          <label for="movie-title" class="popup__label">Название фильма</label>
          <input class="popup__input" id="movie-title" name="movie-name" autocomplete="off">
        </div>
        <div class="popup__form-group">
          <label for="movie-duration" class="popup__label">Длительность, мин</label>
          <input class="popup__input" id="movie-duration" type="number" name="movie-duration" autocomplete="off">
        </div>
        <div class="popup__form-group">
          <label for="movie-description" class="popup__label">Описание</label>
          <textarea class="popup__input popup__input--description" id="movie-description" name="movie-description" autocomplete="off"></textarea>
        </div>
        <div class="popup__form-group">
          <label for="movie-country" class="popup__label">Страна</label>
          <input class="popup__input" id="movie-country" name="movie-country" autocomplete="off">
        </div>
        <div class="popup__actions popup__actions-movie">
          <button class="admin__btn admin__btn-disabled popup__button--save">Сохранить</button>
          <label for="fileInput" class="admin__btn">Загрузить постер</label>
          <input type="file" id="fileInput" name="movie-poster" accept=".png" hidden>
          <button class="admin__btn popup__button--cancel">Отмена</button>
        </div>
      </div>
    </div>  
  `;

  const closeBtn = popup.querySelector('.popup__close');
  const cancelBtn = popup.querySelector('.popup__button--cancel');
  const saveBtn = popup.querySelector('.popup__button--save');
  const titleInput = popup.querySelector('#movie-title');
  const durationInput = popup.querySelector('#movie-duration');
  const descriptionInput = popup.querySelector('#movie-description');
  const countryInput = popup.querySelector('#movie-country');
  const fileInput = popup.querySelector('#fileInput');

  closeBtn.addEventListener('click', () => closePopup(popup));
  cancelBtn.addEventListener('click', () => closePopup(popup));

  const checkSaveButton = () => {
    const isFilled = titleInput.value.trim() &&
                     durationInput.value > 0 &&
                     descriptionInput.value.trim() &&
                     countryInput.value.trim() &&
                     fileInput.files.length > 0;
    saveBtn.classList.toggle('admin__btn-disabled', !isFilled);
  };

  titleInput.addEventListener('input', checkSaveButton);
  durationInput.addEventListener('input', checkSaveButton);
  descriptionInput.addEventListener('input', checkSaveButton);
  countryInput.addEventListener('input', checkSaveButton);
  fileInput.addEventListener('change', checkSaveButton);

  saveBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const duration = parseInt(durationInput.value);
    const description = descriptionInput.value.trim();
    const country = countryInput.value.trim();
    const file = fileInput.files[0];

    if (!title || !duration || !description || !country || !file) {
      alert('Заполните все поля');
      return;
    }

    try {
      const films = await withLoader(() => addMovie(title, duration, description, country, file));
      if (!films?.length) {
        alert('Ошибка: сервер не вернул список фильмов');
        return;
      }
      updateLocalStorageList('films', films);
      closePopup(popup);
      await updateSeancesSection();
    } catch (error) {
      alert('Не удалось добавить фильм: ' + error.message);
    }
  });

  return popup;
}

export async function renderAddSeancePopup() {
  const popup = document.createElement('section');
  popup.classList.add('popup');

  popup.innerHTML = `
    <div class="popup__content">
      <div class="popup__title">
        <span>Добавление сеанса</span>
        <span class="popup__close">×</span>
      </div>
      <div class="popup__form">
        <div class="popup__form-group">
          <label class="popup__label" for="seance-hall-select">Название зала</label>
          <select class="popup__input" id="seance-hall-select">
            <option value="" disabled selected>Выберите зал</option>
          </select>
        </div>
        <div class="popup__form-group">
          <label class="popup__label" for="seance-movie-select">Название фильма</label>
          <select class="popup__input" id="seance-movie-select">
            <option value="" disabled selected>Выберите фильм</option>
          </select>
        </div>
        <div class="popup__form-group">
          <label class="popup__label" for="seance-time-input">Время начала</label>
          <input class="popup__input" id="seance-time-input" type="time" value="00:00">
        </div>
        <div class="popup__actions">
          <button class="admin__btn popup__button--ok">Добавить сеанс</button>
          <button class="admin__btn popup__button--cancel">Отмена</button>
        </div>
      </div>
    </div>  
  `;

  const closeBtn = popup.querySelector('.popup__close');
  const cancelBtn = popup.querySelector('.popup__button--cancel');
  const addBtn = popup.querySelector('.popup__button--ok');
  const hallSelect = popup.querySelector('#seance-hall-select');
  const movieSelect = popup.querySelector('#seance-movie-select');
  const timeInput = popup.querySelector('#seance-time-input');

  const dragData = JSON.parse(localStorage.getItem('dragData') || '{}');

  if (dragData.halls) {
    dragData.halls.forEach(hall => {
      const option = document.createElement('option');
      option.value = hall.id;
      option.textContent = hall.hall_name;
      if (hall.id === dragData.hallId) option.selected = true;
      hallSelect.appendChild(option);
    });
  }

  if (dragData.movies) {
    dragData.movies.forEach(movie => {
      const option = document.createElement('option');
      option.value = movie.id;
      option.textContent = movie.film_name;
      if (movie.id === dragData.movieId) option.selected = true;
      movieSelect.appendChild(option);
    });
  }

  closeBtn.addEventListener('click', () => closePopup(popup));
  cancelBtn.addEventListener('click', () => closePopup(popup));

  addBtn.addEventListener('click', () => {
    const hallId = parseInt(hallSelect.value);
    const movieId = parseInt(movieSelect.value);
    const time = timeInput.value.slice(0, 5); 

    if (!hallId || !movieId || !time) {
      alert('Выберите зал, фильм и время');
      return;
    }

    const movie = dragData.movies.find(m => m.id === movieId);
    if (!movie) {
      alert('Фильм не найден');
      return;
    }
    const duration = movie.film_duration; 

    const [startHours, startMinutes] = time.split(':').map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = startTimeInMinutes + duration;

    if (endTimeInMinutes > 23 * 60 + 59) {
      alert('Сеанс должен заканчиваться не позже 23:59');
      return;
    }

    const pendingSeances = JSON.parse(localStorage.getItem('pendingSeances') || '[]');
    const hallSeances = [
      ...(dragData.seances || []).filter(s => s.seance_hallid === hallId || s.seance_hallid === hallId.toString()),
      ...pendingSeances.filter(s => s.seanceHallid === hallId || s.seanceHallid === hallId.toString())
    ];

    const hasOverlap = hallSeances.some(seance => {
      const seanceMovie = dragData.movies.find(m => m.id === (seance.seance_filmid || seance.seanceFilmid));
      if (!seanceMovie) return false;
      const seanceDuration = seanceMovie.film_duration;
      const seanceTime = seance.seance_time || seance.seanceTime;
      const [seanceHours, seanceMinutes] = seanceTime.split(':').map(Number);
      const seanceStart = seanceHours * 60 + seanceMinutes;
      const seanceEnd = seanceStart + seanceDuration;

      return (startTimeInMinutes < seanceEnd && endTimeInMinutes > seanceStart);
    });

    if (hasOverlap) {
      alert('На это время добавить нельзя: сеанс пересекается с другим');
      return;
    }

    pendingSeances.push({ seanceHallid: hallId, seanceFilmid: movieId, seanceTime: time });
    localStorage.setItem('pendingSeances', JSON.stringify(pendingSeances));

    closePopup(popup);
  });

  return popup;
}

export function renderDeleteSeancePopup(movieName, seanceId) {
  const message = document.createElement('section');
  message.classList.add('popup__remove-seance');
  message.innerHTML = `
    <div class="popup__content">
      <div class="popup__title">
        <h3 class="popup__title-text">Удаление сеанса</h3>
        <button type="button" class="popup__close" aria-label="Закрыть попап">×</button>
      </div>
      <div class="popup__form">
        <p>Вы действительно хотите снять с сеанса фильм
          <span class="popup__film-name">"${movieName}"?</span>
        </p>
        <div class="popup__actions">
          <button class="admin__btn popup__button--ok">Удалить</button>
          <button class="admin__btn popup__button--cancel">Отмена</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(message);

  const closeMessage = () => message.remove();

  message.querySelectorAll('.popup__close, .popup__button--cancel').forEach(btn =>
    btn.addEventListener('click', closeMessage)
  );

  message.querySelector('.popup__button--ok').addEventListener('click', async () => {
    try {
      await withLoader(() => deleteSeance(seanceId));
      const data = JSON.parse(localStorage.getItem('moviesData')) || { halls: [], films: [], seances: [] };
      data.seances = Array.isArray(data.seances) ? data.seances.filter(s => s.id !== +seanceId) : [];
      localStorage.setItem('moviesData', JSON.stringify(data));
      closeMessage();
      await updateSeancesSection(); 
    } catch (error) {
      alert('Не удалось удалить сеанс: ' + error.message);
      closeMessage();
    }
  });

  return message;
}