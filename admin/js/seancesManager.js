import { deleteMovie } from './addDelMoviesApi.js';
import { withLoader } from './apiWrapper.js';
import { addSeance } from './seancesApi.js';
import { renderDeleteSeancePopup } from './adminPopup.js';
import { renderAdminPanel } from './renderAdminDashboard.js';

export default function seancesManager(movies, halls, seances) {
  const wrapper = document.createElement('section');
  wrapper.classList.add('seances-config');

  wrapper.innerHTML = `
    <button class="admin__btn">Добавить фильм</button>
    <div class="seances-config__movies-list"></div>
    <div class="seances-config__halls-list"></div>
    <div class="seances-config__buttons">
      <button class="admin__btn admin__btn-disabled popup__button--cancel">Отмена</button>
      <button class="admin__btn admin__btn-disabled popup__button--save">Сохранить</button>
    </div>
  `;

  const addMovieButton = wrapper.querySelector('.admin__btn:not(.popup__button--cancel):not(.popup__button--save)');
  const moviesList = wrapper.querySelector('.seances-config__movies-list');
  const hallsList = wrapper.querySelector('.seances-config__halls-list');
  const cancelButton = wrapper.querySelector('.popup__button--cancel');
  const saveButton = wrapper.querySelector('.popup__button--save');

  addMovieButton.addEventListener('click', () => {
    localStorage.setItem('scrollPosition', window.scrollY); // Сохраняем позицию скролла
    window.location.hash = '#add-movie';
  });

  function renderMovies(movies) {
    moviesList.innerHTML = '';
    movies.forEach(movie => {
      const movieDiv = document.createElement('div');
      movieDiv.classList.add('seances-config__movie');
      movieDiv.draggable = true;
      movieDiv.setAttribute('data-movie-id', movie.id);
      const color = getGradientColorStep();
      movieDiv.setAttribute('data-color', color);
      movieDiv.innerHTML = `
        <div class="seances-config__movie-poster">
          <img class="seances-config__movie-poster-img" src="${movie.film_poster}" alt="${movie.film_name}">
        </div>
        <div class="seances-config__movie-info">
          <h3 class="seances-config__movie-title">${movie.film_name}</h3>
          <p class="seances-config__movie-duration">${movie.film_duration} мин</p>
          <div class="seances-config__movie-delete" data-id="${movie.id}">
            <img class="seances-config__movie-delete-icon" src="/mov/img/hall.png" alt="удаление фильмов">
          </div>   
        </div>
      `;
      movieDiv.style.backgroundColor = color;

      movieDiv.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', `movie:${movie.id}`);
      });

      movieDiv.addEventListener('touchstart', (e) => {
        window.touchData = {
          id: `movie:${movie.id}`,
          startY: e.touches[0].clientY,
          isDragging: true
        };
      });

      movieDiv.addEventListener('touchmove', (e) => {
        if (window.touchData && window.touchData.isDragging) {
          const deltaY = Math.abs(e.touches[0].clientY - window.touchData.startY);
          if (deltaY > 15) { // Порог для определения скролла
            window.touchData.isDragging = false;
          }
        }
      });

      movieDiv.addEventListener('touchend', () => {
        window.touchData = null;
      });

      moviesList.appendChild(movieDiv);
    });
  }

  function renderHalls(halls, seances) {
    hallsList.innerHTML = '';
    const pendingSeances = JSON.parse(localStorage.getItem('pendingSeances') || '[]');

    const hasPendingSeances = pendingSeances.length > 0;
    cancelButton.classList.toggle('admin__btn-disabled', !hasPendingSeances);
    saveButton.classList.toggle('admin__btn-disabled', !hasPendingSeances);

    // Восстанавливаем позицию прокрутки
    const scrollPosition = localStorage.getItem('scrollPosition');
    if (scrollPosition && window.location.hash === '#admin-dashboard') {
      setTimeout(() => {
        window.scrollTo(0, parseInt(scrollPosition));
        localStorage.removeItem('scrollPosition');
      }, 0);
    }

    halls.forEach(hall => {
      const hallDiv = document.createElement('div');
      hallDiv.classList.add('seances-config__hall');
      hallDiv.innerHTML = `
        <h3 class="seances-config__hall-name">${hall.hall_name}</h3>
        <div class="seances-config__hall-content" data-hall-id="${hall.id}">
          <img class="seances-config__hall-delete-icon" src="/mov/img/cart.png" alt="корзина удаления сеансов">
        </div>
      `;
      hallsList.appendChild(hallDiv);

      requestAnimationFrame(() => {
        const hallContent = hallDiv.querySelector('.seances-config__hall-content');
        const deleteIcon = hallDiv.querySelector('.seances-config__hall-delete-icon');
        const timeStep = 100 / 24;

        hallContent.addEventListener('dragover', (e) => {
          e.preventDefault();
        });

        hallContent.addEventListener('drop', (e) => {
          e.preventDefault();
          const data = e.dataTransfer.getData('text/plain');
          const hallId = +hallContent.dataset.hallId;

          if (data.startsWith('movie:')) {
            const movieId = +data.split(':')[1];
            const dragData = {
              movieId: movieId,
              hallId: hallId,
              movies: [...movies],
              halls: [...halls],
              seances: [...seances]
            };
            localStorage.setItem('dragData', JSON.stringify(dragData));
            localStorage.setItem('scrollPosition', window.scrollY);
            window.location.hash = '#add-seance';
          }
        });

        hallContent.addEventListener('touchend', (e) => {
          if (window.touchData && window.touchData.id.startsWith('movie:') && window.touchData.isDragging) {
            const movieId = +window.touchData.id.split(':')[1];
            const hallId = +hallContent.dataset.hallId;
            const dragData = {
              movieId: movieId,
              hallId: hallId,
              movies: [...movies],
              halls: [...halls],
              seances: [...seances]
            };
            localStorage.setItem('dragData', JSON.stringify(dragData));
            localStorage.setItem('scrollPosition', window.scrollY);
            window.location.hash = '#add-seance';
            window.touchData = null;
          }
        });

        deleteIcon.addEventListener('dragover', (e) => {
          e.preventDefault();
        });

        deleteIcon.addEventListener('drop', (e) => {
          e.preventDefault();
          const data = e.dataTransfer.getData('text/plain');
          if (data.startsWith('seance:')) {
            const seanceId = data.split(':')[1];
            if (seanceId.startsWith('temp-')) return;
            localStorage.setItem('deleteSeanceId', seanceId);
          }
        });

        deleteIcon.addEventListener('touchend', (e) => {
          if (window.touchData && window.touchData.startsWith('seance:')) {
            const seanceId = window.touchData.split(':')[1];
            if (seanceId.startsWith('temp-')) return;
            localStorage.setItem('deleteSeanceId', seanceId);
            window.touchData = null;
          }
        });

        const hallSeances = seances.filter(seance => seance.seance_hallid === hall.id);
        const pendingHallSeances = pendingSeances
          .filter(seance => seance.seanceHallid === hall.id || seance.seanceHallid === hall.id.toString())
          .map(seance => ({
            id: `temp-${Date.now()}-${Math.random()}`,
            seance_hallid: seance.seanceHallid,
            seance_filmid: seance.seanceFilmid,
            seance_time: seance.seanceTime
          }));

        const allSeances = [...hallSeances, ...pendingHallSeances];

        allSeances.forEach(seance => {
          const seanceDiv = document.createElement('div');
          seanceDiv.classList.add('seances-config__seance');
          seanceDiv.setAttribute('data-seance-id', seance.id);
          seanceDiv.setAttribute('data-time', seance.seance_time);
          seanceDiv.draggable = true;
          const [hours, minutes] = seance.seance_time.split(':').map(Number);
          const timeInHours = hours + minutes / 60;
          const leftPosition = timeInHours * timeStep;
          seanceDiv.style.left = `${leftPosition}%`;

          const textSpan = document.createElement('span');
          textSpan.classList.add('seances-config__seance-text');
          const movie = movies.find(movie => movie.id === seance.seance_filmid || movie.id === +seance.seance_filmid);
          textSpan.textContent = movie ? movie.film_name : 'Фильм не найден';
          seanceDiv.appendChild(textSpan);

          const movieElement = moviesList.querySelector(`.seances-config__movie-delete[data-id="${seance.seance_filmid}"]`)?.closest('.seances-config__movie');
          seanceDiv.style.backgroundColor = movieElement ? movieElement.dataset.color : '#ccc';
          if (seance.id.toString().startsWith('temp-')) {
            seanceDiv.style.opacity = '0.5';
          }

          let droppedOnDelete = false;
          seanceDiv.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', `seance:${seance.id}`);
            deleteIcon.style.display = 'block';
            droppedOnDelete = false;
          });

          seanceDiv.addEventListener('touchstart', (e) => {
            window.touchData = `seance:${seance.id}`;
            deleteIcon.style.display = 'block';
            droppedOnDelete = false;
          });

          deleteIcon.addEventListener('drop', (e) => {
            if (e.dataTransfer.getData('text/plain') === `seance:${seance.id}`) {
              droppedOnDelete = true;
            }
          });

          deleteIcon.addEventListener('touchend', (e) => {
            if (window.touchData === `seance:${seance.id}`) {
              droppedOnDelete = true;
            }
          });

          seanceDiv.addEventListener('dragend', () => {
            deleteIcon.style.display = 'none';
            if (droppedOnDelete && !seance.id.toString().startsWith('temp-')) {
              renderDeleteSeancePopup(movie.film_name, seance.id);
            }
          });

          seanceDiv.addEventListener('touchend', () => {
            deleteIcon.style.display = 'none';
            if (droppedOnDelete && !seance.id.toString().startsWith('temp-')) {
              renderDeleteSeancePopup(movie.film_name, seance.id);
            }
            window.touchData = null;
          });

          hallContent.appendChild(seanceDiv);
        });
      });
    });
  }

  let currentHue = 90;
  function getGradientColorStep() {
    const saturation = 100;
    const lightness = 75;
    const color = `hsl(${currentHue}, ${saturation}%, ${lightness}%)`;
    currentHue += 37;
    if (currentHue > 230) currentHue = 90;
    return color;
  }

  renderMovies(movies);
  renderHalls(halls, seances);

  cancelButton.addEventListener('click', () => {
    localStorage.removeItem('pendingSeances');
    renderHalls(halls, seances);
  });

  saveButton.addEventListener('click', async () => {
    const pendingSeances = JSON.parse(localStorage.getItem('pendingSeances') || '[]');
    if (pendingSeances.length === 0) return;

    try {
      for (const seance of pendingSeances) {
        await withLoader(() => addSeance(
          +seance.seanceHallid,
          +seance.seanceFilmid,
          seance.seanceTime
        ));
      }
      localStorage.removeItem('pendingSeances');
      localStorage.setItem('scrollPosition', window.scrollY);
      await renderAdminPanel();
    } catch (error) {
      alert('Не удалось сохранить сеансы');
    }
  });

  moviesList.addEventListener('click', async (event) => {
    const deleteButton = event.target.closest('.seances-config__movie-delete');
    if (!deleteButton) return;

    const filmId = +deleteButton.dataset.id;
    if (!filmId) return;

    try {
      const result = await withLoader(() => deleteMovie(filmId));
      renderMovies(result.films);
      localStorage.setItem('scrollPosition', window.scrollY);
      await renderAdminPanel();
    } catch (error) {
      alert('Не удалось удалить фильм');
    }
  });

  return wrapper;
}

export function clearDragData() {
  localStorage.removeItem('dragData');
}