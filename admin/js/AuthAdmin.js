import login from './authAdminApi.js';
import { withLoader } from './apiWrapper.js';

function renderLoginForm(container) {
  container.innerHTML = `
    <section class="admin__login">
      <h2 class="admin__login-header">авторизация</h2>
      <form class="admin__login-form">
        <div class="admin__login-container">
          <div class="admin__login-error"></div>
          <label for="email" class="admin__login-label">E-mail</label>
          <input id="email" class="admin__login-input" type="email" required autocomplete="email" name="email">
        </div>
        <div class="admin__login-container">
          <label for="password" class="admin__login-label">Пароль</label>
          <input id="password" class="admin__login-input" type="password" required autocomplete="current-password" name="password">
        </div>
        <button type="submit" class="admin__btn admin__btn_login">Авторизоваться</button>
      </form>
    </section>
  `;

  container.querySelector('.admin__login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = container.querySelector('#email').value;
    const password = container.querySelector('#password').value;
    const adminLoginError = document.querySelector('.admin__login-error');

    try {
      await withLoader(async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return login({ login: email, password });
      });
      localStorage.setItem('isAuthenticated', 'true');
      window.location.hash = '#admin-dashboard';
    } catch (error) {
      console.error('Ошибка:', error.message);
      adminLoginError.style.display = 'block';
      adminLoginError.textContent = 'Неверный логин или пароль';
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('authError');
      window.location.hash = '';
    }
  });
}

export default renderLoginForm;