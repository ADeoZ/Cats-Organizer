export default class Login {
  constructor(element, server) {
    this.server = server;
    this.parentElement = element;

    this.container = document.createElement('div');
    this.container.classList.add('chat_login');
    this.container.innerHTML = `
    <form class="chat_login_form">
      <h3>Введите никнейм</h3>
      <div class="chat_login_container">
        <input name="login" class="chat_login_input">
      </div>
      <button>Войти</button>
    </form>`;
    this.parentElement.append(this.container);

    this.form = this.parentElement.querySelector('.chat_login_form');
    this.nickElement = this.parentElement.querySelector('.chat_login_input');

    this.login = this.login.bind(this);
    this.showError = this.showError.bind(this);
    this.removeError = this.removeError.bind(this);
  }

  connect() {
    this.form.addEventListener('submit', this.login);
  }

  login(e) {
    e.preventDefault();
    if (this.nickElement.value === '') {
      this.showError({ reason: 'Укажите логин' });
      return;
    }

    this.ws = new WebSocket(this.server);

    this.ws.addEventListener('open', () => {
      this.ws.send(JSON.stringify({ event: 'login', message: this.nickElement.value }));
    });

    this.ws.addEventListener('message', (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.event === 'connect') {
        this.clientsList = msg.message;
        this.parentElement.dispatchEvent(new Event('connect'));
      }
    });

    this.ws.addEventListener('close', this.showError);

    this.ws.addEventListener('error', (evt) => {
      console.error(evt);
    });
  }

  showError(evt) {
    const error = document.createElement('div');
    error.classList.add('chat_login_error');
    error.innerText = evt.reason;
    this.parentElement.querySelector('.chat_login_container').append(error);
    error.style.left = `${this.nickElement.offsetLeft + this.nickElement.offsetWidth / 2 - error.offsetWidth / 2}px`;
    error.style.top = `${this.nickElement.offsetTop + this.nickElement.offsetHeight}px`;

    this.nickElement.addEventListener('focus', this.removeError);
  }

  removeError() {
    this.nickElement.value = '';
    const error = this.parentElement.querySelector('.chat_login_error');
    if (error) {
      error.remove();
    }
  }

  closeForm() {
    this.container.remove();
  }
}
