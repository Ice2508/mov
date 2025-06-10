import { createHallTabs } from './hallTabs.js';
import sendHallConfig from './hallConfigurationApi.js';
import { withLoader } from './apiWrapper.js';

async function configureHalls(halls) {
  const wrapper = document.createElement('section');
  wrapper.classList.add('hall-config');
  let activeHallIndex = 0;
  let activeHall = halls[activeHallIndex] || null;

  // Создаем вкладки
  const hallTabs = createHallTabs(halls, activeHallIndex, (newIndex, newHall) => {
    activeHallIndex = newIndex;
    activeHall = newHall;
    rowsInput.value = activeHall ? activeHall.hall_rows : '';
    seatsInput.value = activeHall ? activeHall.hall_places : '';
    const seatsGrid = wrapper.querySelector('.hall-config__seats-grid');
    seatsGrid.innerHTML = generateSeatsGrid(activeHall);
    updateButtonState();
  }, 'Выберите зал для конфигурации:');

  wrapper.innerHTML = `
    <div class="hall-config__form">
      <p class="hall-config__title">Укажите количество рядов и максимальное количество кресел в ряду:</p>
      <div class="hall-config__form-group">    
        <label for="input_type-rows" class="hall-config__label">Рядов, шт</label>
        <input type="number" id="input_type-rows" class="hall-config__input" min="0" value="${activeHall?.hall_rows || ''}">
      </div>
      <div class="hall-config__form-group">
        <span class="hall-config_x">x</span>
      </div>
      <div class="hall-config__form-group">
        <label for="input_type-seats" class="hall-config__label">Мест, шт</label>
        <input type="number" id="input_type-seats" class="hall-config__input" min="0" value="${activeHall?.hall_places || ''}">
      </div>
    </div>
    <div class="hall-config__legend">
      <p class="hall-config__title">Теперь вы можете указать типы кресел на схеме зала:</p>
      <div class="hall-config__seat-legend">
          <div class="hall-config__seat-legend-item"> 
            <div class="hall-config__seat-type hall-config__seat-type--standard" aria-hidden="true"></div>
            <span>— обычные кресла</span>
          </div>
          <div class="hall-config__seat-legend-item">
            <div class="hall-config__seat-type hall-config__seat-type--vip" aria-hidden="true"></div>
            <span>— VIP кресла</span>
          </div>
          <div class="hall-config__seat-legend-item">
            <div class="hall-config__seat-type hall-config__seat-type--disabled" aria-hidden="true"></div>
            <span>— заблокированные (нет кресла)</span>
          </div>
        </div>
        <p class="hall-config__hint">
          Чтобы изменить вид кресла, нажмите по нему левой кнопкой мыши
        </p>
        <div class="hall-config__scheme">
          <div class="hall-config__screen">экран</div>
          <div class="hall-config__seats-grid">${generateSeatsGrid(activeHall)}</div>
        </div>  
      </div>
      <div class="hall-config__buttons">
        <button class="admin__btn admin__btn-disabled popup__button--cancel">Отмена</button>
        <button class="admin__btn admin__btn-disabled popup__button--save">Сохранить</button>
      </div>
  `;

  wrapper.prepend(hallTabs);

  function generateSeatsGrid(hall) {
    let seatsGridContent = '';
    if (hall?.hall_config) {
      for (let row of hall.hall_config) {
        seatsGridContent += '<div class="hall-config__row">';
        for (let seat of row) {
          if (seat === 'standart') {
            seatsGridContent += '<div class="seat hall-config__seat-type hall-config__seat-type--standard" aria-hidden="true"></div>';
          } else if (seat === 'vip') {
            seatsGridContent += '<div class="seat hall-config__seat-type hall-config__seat-type--vip" aria-hidden="true"></div>';
          } else if (seat === 'disabled') {
            seatsGridContent += '<div class="seat hall-config__seat-type hall-config__seat-type--disabled" aria-hidden="true"></div>';
          }
        }
        seatsGridContent += '</div>';
      }
    }
    return seatsGridContent;
  }

  function getConfigFromDOM() {
    const rows = wrapper.querySelectorAll('.hall-config__row');
    const config = [];
    rows.forEach(row => {
      const seats = row.querySelectorAll('.seat');
      const rowConfig = [];
      seats.forEach(seat => {
        if (seat.classList.contains('hall-config__seat-type--standard')) {
          rowConfig.push('standart');
        } else if (seat.classList.contains('hall-config__seat-type--vip')) {
          rowConfig.push('vip');
        } else if (seat.classList.contains('hall-config__seat-type--disabled')) {
          rowConfig.push('disabled');
        }
      });
      config.push(rowConfig);
    });
    return config;
  }

  function updateHallConfig(hall, newRows, newSeats) {
    const currentConfig = hall.hall_config || [];
    const newConfig = [];
    const currentRows = currentConfig.length;
    const currentSeats = currentConfig[0]?.length || 0;

    for (let i = 0; i < newRows; i++) {
      const newRow = [];
      for (let j = 0; j < newSeats; j++) {
        if (i < currentRows && j < currentSeats && currentConfig[i][j]) {
          newRow.push(currentConfig[i][j]);
        } else {
          newRow.push('standart');
        }
      }
      newConfig.push(newRow);
    }

    hall.hall_config = newConfig;
    hall.hall_rows = newRows;
    hall.hall_places = newSeats;
  }

  const initialStates = new Map();
  halls.forEach(hall => {
    initialStates.set(hall.id, {
      rows: hall.hall_rows,
      places: hall.hall_places,
      config: JSON.stringify(hall.hall_config)
    });
  });

  const rowsInput = wrapper.querySelector('#input_type-rows');
  const seatsInput = wrapper.querySelector('#input_type-seats');
  const cancelButton = wrapper.querySelector('.popup__button--cancel');
  const saveButton = wrapper.querySelector('.popup__button--save');

  function updateButtonState() {
    const currentRows = parseInt(rowsInput.value) || 0;
    const currentPlaces = parseInt(seatsInput.value) || 0;
    const currentConfig = JSON.stringify(getConfigFromDOM());
    const initialState = initialStates.get(activeHall?.id);

    const hasChanges = initialState && (
      currentRows !== initialState.rows ||
      currentPlaces !== initialState.places ||
      currentConfig !== initialState.config
    );

    cancelButton.classList.toggle('admin__btn-disabled', !hasChanges);
    saveButton.classList.toggle('admin__btn-disabled', !hasChanges);
  }

  wrapper.addEventListener('click', (event) => {
    const seat = event.target.closest('.seat');
    if (!seat) return;

    const seatTypes = [
      'hall-config__seat-type--standard',
      'hall-config__seat-type--vip',
      'hall-config__seat-type--disabled'
    ];

    const currentIndex = seatTypes.findIndex(cls => seat.classList.contains(cls));
    seat.classList.remove(seatTypes[currentIndex]);
    const nextIndex = (currentIndex + 1) % seatTypes.length;
    seat.classList.add(seatTypes[nextIndex]);

    // Обновляем activeHall.hall_config
    activeHall.hall_config = getConfigFromDOM();
    // Перерисовываем сетку
    const seatsGrid = wrapper.querySelector('.hall-config__seats-grid');
    seatsGrid.innerHTML = generateSeatsGrid(activeHall);
    updateButtonState();
  });

  rowsInput.addEventListener('input', () => {
    let newRows = parseInt(rowsInput.value);
    if (isNaN(newRows) || newRows <= 0) {
      newRows = 1;
      rowsInput.value = 1;
    } else if (newRows > 15) {
      newRows = 15;
      rowsInput.value = 15;
    }
    let newSeats = parseInt(seatsInput.value);
    if (isNaN(newSeats) || newSeats <= 0) {
      newSeats = 1;
      seatsInput.value = 1;
    } else if (newSeats > 15) {
      newSeats = 15;
      seatsInput.value = 15;
    }
    if (activeHall) {
      updateHallConfig(activeHall, newRows, newSeats);
      const seatsGrid = wrapper.querySelector('.hall-config__seats-grid');
      seatsGrid.innerHTML = generateSeatsGrid(activeHall);
      updateButtonState();
    }
  });

  seatsInput.addEventListener('input', () => {
    let newSeats = parseInt(seatsInput.value);
    if (isNaN(newSeats) || newSeats <= 0) {
      newSeats = 1;
      seatsInput.value = 1;
    } else if (newSeats > 15) {
      newSeats = 15;
      seatsInput.value = 15;
    }
    let newRows = parseInt(rowsInput.value);
    if (isNaN(newRows) || newRows <= 0) {
      newRows = 1;
      rowsInput.value = 1;
    } else if (newRows > 15) {
      newRows = 15;
      rowsInput.value = 15;
    }
    if (activeHall) {
      updateHallConfig(activeHall, newRows, newSeats);
      const seatsGrid = wrapper.querySelector('.hall-config__seats-grid');
      seatsGrid.innerHTML = generateSeatsGrid(activeHall);
      updateButtonState();
    }
  });

  cancelButton.addEventListener('click', () => {
    const initialState = initialStates.get(activeHall?.id);
    if (initialState) {
      activeHall.hall_rows = initialState.rows;
      activeHall.hall_places = initialState.places;
      activeHall.hall_config = JSON.parse(initialState.config);
    }
    rowsInput.value = activeHall?.hall_rows || '';
    seatsInput.value = activeHall?.hall_places || '';
    wrapper.querySelector('.hall-config__seats-grid').innerHTML = generateSeatsGrid(activeHall);
    updateButtonState();
  });

  saveButton.addEventListener('click', async () => {
    const hallId = activeHall?.id || null;
    const rowCount = parseInt(rowsInput.value) || 0;
    const placeCount = parseInt(seatsInput.value) || 0;
    const config = getConfigFromDOM();

    if (!hallId || rowCount <= 0 || placeCount <= 0 || !config || config.length === 0 || config.some(row => row.length !== placeCount)) {
      return;
    }

    const result = await withLoader(() => sendHallConfig(hallId, rowCount, placeCount, config));
    if (result?.success) {
      initialStates.set(hallId, {
        rows: rowCount,
        places: placeCount,
        config: JSON.stringify(config)
      });
      updateButtonState();
    }
  });

  return wrapper;
}

export default configureHalls;