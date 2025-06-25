export async function addSeance(seanceHallid, seanceFilmid, seanceTime) {
  try {
    const response = await fetch('https://shfe-diplom.neto-server.ru/seance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seanceHallid, seanceFilmid, seanceTime })
    });

    if (!response.ok) throw new Error('Ошибка добавления сеанса');
    return await response.json();
  } catch (error) {
    throw new Error(`Не удалось добавить сеанс: ${error.message}`);
  }
}

export async function deleteSeance(seanceId) {
  try {
    const response = await fetch(`https://shfe-diplom.neto-server.ru/seance/${seanceId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Ошибка удаления сеанса');
    const result = await response.json();
    return result.seances;
  } catch (error) {
    console.error('Ошибка в deleteSeance:', error);
    throw new Error(`Не удалось удалить сеанс: ${error.message}`);
  }
}