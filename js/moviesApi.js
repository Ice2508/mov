async function fetchAllData() {
  try {
    const response = await fetch('https://shfe-diplom.neto-server.ru/alldata');
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    const data = await response.json();
    return {
      halls: data.result.halls,
      films: data.result.films,
      seances: data.result.seances,
    };
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    throw error; 
  }
}

export default fetchAllData;