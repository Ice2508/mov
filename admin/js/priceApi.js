export async function updateHallPrices(hallId, priceStandart, priceVip) {
  const params = new FormData();
  params.set('priceStandart', priceStandart.toString());
  params.set('priceVip', priceVip.toString());

  try {
    const response = await fetch(`https://shfe-diplom.neto-server.ru/price/${hallId}`, {
      method: 'POST',
      body: params
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при сохранении цен:', error);
    throw error;
  }
}