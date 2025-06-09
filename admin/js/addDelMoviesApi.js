export async function addMovie(filmName, filmDuration, filmDescription, filmOrigin, filePoster) {
  if (filePoster && filePoster.size > 3 * 1024 * 1024) {
    throw new Error('Файл не должен превышать 3 МБ');
  }

  const formData = new FormData();
  formData.append('filmName', filmName);
  formData.append('filmDuration', filmDuration);
  formData.append('filmDescription', filmDescription);
  formData.append('filmOrigin', filmOrigin);
  if (filePoster) formData.append('filePoster', filePoster);

  try {
    const response = await fetch('https://shfe-diplom.neto-server.ru/film', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    return data.result.films;
  } catch (error) {
    throw new Error('Ошибка добавления фильма');
  }
}

export async function deleteMovie(filmId) {
  try {
    const response = await fetch(`https://shfe-diplom.neto-server.ru/film/${filmId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    return { films: data.result.films, seances: data.result.seances };
  } catch (error) {
    throw new Error('Ошибка удаления фильма');
  }
}