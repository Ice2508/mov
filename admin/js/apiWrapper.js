export async function withLoader(apiCall) {
  let loader = document.querySelector('.loading');
  if (!loader) {
    loader = document.createElement('img');
    loader.className = 'loading';
    loader.src = '../img/loading5.gif';
    loader.alt = 'загрузка';
    document.body.appendChild(loader);
  }

  try {
    loader.classList.add('show');
    const result = await apiCall();
    return result;
  } finally {
    loader.classList.remove('show');
  }
}