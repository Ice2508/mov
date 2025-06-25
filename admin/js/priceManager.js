import { createHallTabs } from './hallTabs.js';
import { updateHallPrices } from './priceApi.js';
import { withLoader } from './apiWrapper.js';

export default function priceManager(halls) {
  const wrapper = document.createElement('section');
  wrapper.classList.add('ticket-config');
  let activeHallIndex = 0;
  let activeHall = halls[activeHallIndex] || null;

  const initialPrices = new Map();
  halls.forEach(hall => {
    initialPrices.set(hall.id, {
      standard: hall.hall_price_standart,
      vip: hall.hall_price_vip
    });
  });

  const hallTabs = createHallTabs(halls, activeHallIndex, (newIndex, newHall) => {
    activeHallIndex = newIndex;
    activeHall = newHall;
    const standardPriceInput = wrapper.querySelector('#standard-price');
    const vipPriceInput = wrapper.querySelector('#vip-price');
    if (standardPriceInput && vipPriceInput) {
      standardPriceInput.value = activeHall?.hall_price_standart || '';
      vipPriceInput.value = activeHall?.hall_price_vip || '';
    }
    updateButtonState();
  }, 'Выберите зал для конфигурации:');

  wrapper.innerHTML = `
    <div class="ticket-config__form">
      <h3 class="hall-config__title">Установите цены для типов кресел:</h3>
      <label for="standard-price" class="ticket-config__label hall-config__label">Цена, рублей</label>
      <div class="ticket-config__input-group">
        <input type="number" id="standard-price" class="ticket-config__input ticket-config__input--standard" min="0" value="${activeHall?.hall_price_standart || ''}" autocomplete="off">
        <div class="ticket-config__description">
          <span class="ticket-config__description-text">Цена за</span><div class="hall-config__seat-type hall-config__seat-type--standard" aria-hidden="true"></div><span class="ticket-config__description-text">обычные кресла</span>
        </div>
      </div>
    </div>
    <div class="ticket-config__form">
      <label for="vip-price" class="ticket-config__label hall-config__label">Цена, рублей</label>
      <div class="ticket-config__input-group">
        <input type="number" id="vip-price" class="ticket-config__input ticket-config__input--vip" min="0" value="${activeHall?.hall_price_vip || ''}" autocomplete="off">
        <div class="ticket-config__description">
          <span class="ticket-config__description-text">Цена за</span><div class="hall-config__seat-type hall-config__seat-type--vip" aria-hidden="true"></div><span class="ticket-config__description-text">VIP кресла</span>
        </div>
      </div>
    </div>
    <div class="hall-config__buttons">
      <button class="admin__btn admin__btn-disabled popup__button--cancel">Отмена</button>
      <button class="admin__btn admin__btn-disabled popup__button--save">Сохранить</button>
    </div>
  `;

  wrapper.prepend(hallTabs);

  const standardPriceInput = wrapper.querySelector('#standard-price');
  const vipPriceInput = wrapper.querySelector('#vip-price');
  const cancelButton = wrapper.querySelector('.popup__button--cancel');
  const saveButton = wrapper.querySelector('.popup__button--save');

  function updateButtonState() {
    const currentStandardPrice = parseInt(standardPriceInput.value) || 0;
    const currentVipPrice = parseInt(vipPriceInput.value) || 0;
    const initial = initialPrices.get(activeHall?.id);

    const hasChanges = initial && (
      currentStandardPrice !== initial.standard ||
      currentVipPrice !== initial.vip
    );

    cancelButton.classList.toggle('admin__btn-disabled', !hasChanges);
    saveButton.classList.toggle('admin__btn-disabled', !hasChanges);
  }

  standardPriceInput.addEventListener('input', updateButtonState);
  vipPriceInput.addEventListener('input', updateButtonState);

  cancelButton.addEventListener('click', () => {
    const initial = initialPrices.get(activeHall?.id);
    if (initial) {
      standardPriceInput.value = initial.standard || '';
      vipPriceInput.value = initial.vip || '';
    }
    updateButtonState();
  });

  saveButton.addEventListener('click', async () => {
    const hallId = activeHall?.id;
    const priceStandart = parseInt(standardPriceInput.value) || 0;
    const priceVip = parseInt(vipPriceInput.value) || 0;

    if (!hallId || priceStandart < 0 || priceVip < 0) {
      return;
    }

    try {
      const data = await withLoader(() => updateHallPrices(hallId, priceStandart, priceVip));
      if (data.result?.id) {
        initialPrices.set(hallId, {
          standard: priceStandart,
          vip: priceVip
        });
        activeHall.hall_price_standart = priceStandart;
        activeHall.hall_price_vip = priceVip;
        updateButtonState();
      }
    } catch (error) {}
  });

  return wrapper;
}