export async function setHallStatus(hallId, hallOpen) {
  const params = new FormData();
  params.set('hallOpen', hallOpen.toString());
  const response = await fetch(`https://shfe-diplom.neto-server.ru/open/${hallId}`, {
    method: 'POST',
    body: params
  });
  if (!response.ok) {
    throw new Error(`HTTP ошибка: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.success || !data.result || !Array.isArray(data.result.halls)) {
    throw new Error('Некорректный формат ответа API: отсутствует success, result или halls');
  }
  const updatedHall = data.result.halls.find(hall => hall.id === hallId);
  if (!updatedHall) {
    throw new Error(`Зал с ID ${hallId} не найден в ответе API`);
  }
  if (typeof updatedHall.hall_open === 'undefined') {
    throw new Error('Некорректный формат ответа API: отсутствует hall_open в зале');
  }
  return updatedHall;
}