export async function addHall(hallName) {
  try {
    const response = await fetch('https://shfe-diplom.neto-server.ru/hall', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hallName }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка сети: ${response.status}`);
    }

    const data = await response.json();
    console.log('Полный ответ сервера:', data);
    return data.result.halls; 
  } catch (error) {
    console.error('Ошибка в addHall:', error);
    throw error;
  }
}

export async function deleteHall(hallId) {
  try {
    const response = await fetch(`https://shfe-diplom.neto-server.ru/hall/${hallId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Ошибка при удалении: ${response.status}`);
    }

    const data = await response.json();
    console.log('Удаление прошло успешно. Ответ сервера:', data);
    
    // Возвращаем список залов и сеансов
    return {
      halls: data.halls || [],
      seances: data.seances || [],
    };
  } catch (error) {
    console.error('Ошибка в deleteHall:', error);
    throw error;
  }
}