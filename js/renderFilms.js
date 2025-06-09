import fetchAllData from './moviesApi.js';

async function loadDataAndUse() {
  const { halls, films, seances } = await fetchAllData();
  console.log(halls, films, seances);

  const container = document.getElementById('main');
  container.innerHTML = '';

  // Получаем выбранную дату из localStorage
  const savedDate = JSON.parse(localStorage.getItem('date'));
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = !savedDate || savedDate === todayStr;
  const now = new Date();

  films.forEach(film => {
    const card = document.createElement('section');
    card.classList.add('movie-card');
    card.innerHTML = `
      <div class="movie-card__content">
        <img class="movie-card__poster" src="${film.film_poster}" alt="Постер ${film.film_name}">
        <div class="movie-card__info">
          <h3 class="movie-card__title">${film.film_name}</h3>
          <p class="movie-card__description">${film.film_description}</p>
          <p class="movie-card__details">${film.film_duration} мин ${film.film_origin}</p>
        </div>
      </div>
    `;

    const hallsContainer = document.createElement('div');
    hallsContainer.classList.add('movie-card__halls');

    halls.forEach(hall => {
      // Пропускаем залы, где hall_open === 0
      if (hall.hall_open === 0) return;

      const hallSeances = seances.filter(s =>
        s.seance_filmid === film.id && s.seance_hallid === hall.id
      );

      if (hallSeances.length === 0) return;

      const hallCard = document.createElement('div');
      hallCard.classList.add('movie-card__hall');

      let seancesHTML = hallSeances
        .sort((a, b) => a.seance_time.localeCompare(b.seance_time))
        .map(seance => {
          let className = 'movie-card__hall-seance';

          if (isToday) {
            const seanceDateTime = new Date(`${todayStr}T${seance.seance_time}`);
            if (seanceDateTime < now) {
              className = 'movie-card__hall-seance noactive';
            }
          }

          return `<a href="#seance=${seance.id}" class="${className}">${seance.seance_time}</a>`;
        }).join('');

      hallCard.innerHTML = `
        <h3 class="movie-card__hall-title">${hall.hall_name}</h3>
        <nav class="movie-card__hall-sessions">${seancesHTML}</nav>
      `;

      hallsContainer.appendChild(hallCard);
    });

    // Добавляем карточку фильма только если есть залы с сеансами
    if (hallsContainer.children.length > 0) {
      card.appendChild(hallsContainer);
      container.appendChild(card);
    }
  });
}

export default loadDataAndUse;