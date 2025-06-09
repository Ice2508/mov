import { getSelectedDate } from './calendar.js';
import { getSeanceId } from './renderBooking.js';

export async function buyTickets() {
  // Безопасно парсим selectedSeats, с fallback на пустой массив
  const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats') || '[]');
  const seanceId = getSeanceId();
  let ticketDate;

  // Проверяем текущую дату
  const today = new Date().toISOString().split('T')[0]; // Например, "2025-05-27"

  // Пробуем получить ticketDate из localStorage
  try {
    ticketDate = JSON.parse(localStorage.getItem('date'));
  } catch (error) {
    console.warn('Ошибка при парсинге ticketDate из localStorage:', error.message);
    ticketDate = null;
  }

  // Если ticketDate null или это сегодняшняя дата, используем текущую дату
  if (!ticketDate || ticketDate === today) {
    ticketDate = today;
    console.log('Используется текущая дата, так как ticketDate null или сегодня:', ticketDate);
  }

  // Проверяем входные данные
  if (!selectedSeats || selectedSeats.length === 0) {
    console.warn('Нет выбранных мест для покупки');
    return null;
  }

  if (!seanceId) {
    console.warn('seanceId отсутствует', { seanceId });
    return null;
  }

  // Проверяем формат ticketDate
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(ticketDate)) {
    console.warn('Неверный формат ticketDate:', ticketDate);
    return null;
  }

  const tickets = selectedSeats.map(({ row, place, price }) => ({
    row: Number(row),
    place: Number(place),
    coast: Number(price),
  }));

  const formData = new FormData();
  formData.append('seanceId', seanceId);
  formData.append('ticketDate', ticketDate);
  formData.append('tickets', JSON.stringify(tickets));

  console.log('FormData:', Object.fromEntries(formData));

  try {
    const response = await fetch('https://shfe-diplom.neto-server.ru/ticket', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Ошибка при покупке билетов: ${response.status} ${response.statusText}`);
      console.error('Текст ошибки:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('Полный ответ сервера:', data);

    if (!data.success || !Array.isArray(data.result)) {
      console.error('Ошибка: билеты не получены', {
        success: data.success,
        result: data.result,
        error: data.error || 'Неизвестная ошибка',
      });
      return null;
    }

    console.log('Запрос успешно отправлен, билеты:', data.result);
    return data.result;
  } catch (error) {
    console.error('Ошибка при отправке запроса:', error.message);
    console.error('Полная ошибка:', error);
    return null;
  }
}