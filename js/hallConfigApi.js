async function fetchHallConfig(seanceId, date) {
  const url = `https://shfe-diplom.neto-server.ru/hallconfig?seanceId=${seanceId}&date=${date}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при получении конфигурации зала:', error);
    return null;
  }
}

export default fetchHallConfig;