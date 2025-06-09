async function login({ login, password }) {
  const response = await fetch('https://shfe-diplom.neto-server.ru/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.result || 'Ошибка авторизации');
  }
  
  return data;
}

export default login;