export async function withLoader(apiCall) {
  let loader = document.querySelector('.loading');
  if (!loader) {
    loader = document.createElement('img');
    loader.className = 'loading';
    loader.src = '../img/loading5.gif'; // Абсолютный путь
    document.body.appendChild(loader);
    console.log('Элемент .loading создан динамически');
  }

  try {
    loader.classList.add('show');
    const result = await apiCall();
    return result;
  } finally {
    loader.classList.remove('show');
  }
}