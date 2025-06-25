export function createHallTabs(halls, activeHallIndex = 0, onHallChange, tabsTitle) {
  const nav = document.createElement('nav');
  nav.classList.add('hall-config__section_selection');

  const hallsList = halls.length > 0
    ? halls.map((hall, index) => `
        <li class="hall-config__item ${index === activeHallIndex ? 'hall-config__item-active' : ''}" data-id="${hall.id}">${hall.hall_name}</li>
      `).join('')
    : '<p>Нет доступных залов</p>';

  nav.innerHTML = `
    <h3 class="hall-config__title">${tabsTitle}</h3>
    <ul class="hall-config__list">${hallsList}</ul>
  `;

  const hallItems = nav.querySelectorAll('.hall-config__item');
  hallItems.forEach(item => {
    item.addEventListener('click', () => {
      hallItems.forEach(i => i.classList.remove('hall-config__item-active'));
      item.classList.add('hall-config__item-active');
      const activeHallId = parseInt(item.getAttribute('data-id'));
      const newIndex = halls.findIndex(hall => hall.id === activeHallId);
      if (newIndex !== -1 && onHallChange) {
        onHallChange(newIndex, halls[newIndex]);
      }
    });
  });

  return nav;
}