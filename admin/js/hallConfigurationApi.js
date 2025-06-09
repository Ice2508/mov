







async function sendHallConfig(hallId, rowCount, placeCount, config) {
  if (!hallId) {
    console.error('ID зала не определен');
    return;
  }

  const params = new FormData();
  params.set('rowCount', rowCount.toString());
  params.set('placeCount', placeCount.toString());
  params.set('config', JSON.stringify(config));

  try {
    const response = await fetch(`https://shfe-diplom.neto-server.ru/hall/${hallId}`, {
      method: 'POST',
      body: params
    });
    const data = await response.json();
    console.log('Ответ сервера:', data);
    return data;
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

export default sendHallConfig;