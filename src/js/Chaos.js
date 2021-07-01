import Request from './Request';
import DOM from './DOM';
import SidePanel from './SidePanel';
import FileLoader from './FileLoader';

export default class Chaos {
  constructor(element, server) {
    this.server = server;

    // Собираем элементы
    this.parentElement = element;
    this.formElement = this.parentElement.querySelector('.chaos_form');
    this.inputElement = this.formElement.querySelector('.chaos_form_input');
    this.clipElement = this.formElement.querySelector('.chaos_form_clip');
    this.addFormElement = this.formElement.querySelector('.chaos_add_container');
    this.addImageElement = this.addFormElement.querySelector('.chaos_add_images');
    this.messagesElement = this.parentElement.querySelector('.chaos_messages');

    // Заводим вспомогательные классы
    this.request = new Request(this.server);
    this.sidePanel = new SidePanel(this.parentElement.querySelector('aside.chaos_side'), this.request);
    this.fileLoader = new FileLoader(this.parentElement, this.request);

    // Привязываем контекст
    this.submitForm = this.submitForm.bind(this);
    this.showAddForm = this.showAddForm.bind(this);
    this.removeError = this.removeError.bind(this);
    this.connectionError = this.connectionError.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.addFile = this.addFile.bind(this);
    this.renderMessages = this.renderMessages.bind(this);
    this.lazyLoad = this.lazyLoad.bind(this);
    this.showMessage = this.showMessage.bind(this);
    this.closeMessage = this.closeMessage.bind(this);
  }

  init() {
    // Соединяемся с WebSocket
    this.request.callbacks = {
      error: this.connectionError,
      load: this.renderMessages,
      message: this.addMessage,
      file: this.addFile,
      sideLoad: this.sidePanel.render,
      sideCategory: this.sidePanel.showCategoryItems,
      showMessage: this.showMessage,
    };
    this.request.init();

    this.messagesElement.addEventListener('scroll', this.lazyLoad);
    this.formElement.addEventListener('submit', this.submitForm);
    this.clipElement.addEventListener('click', this.showAddForm);
    this.addImageElement.addEventListener('click', this.fileLoader.openForm);
  }

  // Отрисовка сообщений снизу вверх
  renderMessages(data, position) {
    console.log(data);
    for (const message of data) {
      let messageElement = '';
      switch (message.type) {
        case 'text': {
          messageElement = DOM.createMessageElement(message.message, message.date);
          break;
        }
        case 'image': {
          messageElement = DOM.createImageElement(this.server, message.message, message.date);
          break;
        }
        case 'video': {
          break;
        }
        default: {
          return;
        }
      }
      this.messagesElement.prepend(messageElement);
    }

    // Если первичная загрузка, то проматываем вниз
    if (!this.databasePosition) {
      this.messagesElement.scrollTop = this.messagesElement.scrollHeight
    - this.messagesElement.getBoundingClientRect().height;
    }
    // Если "ленивая" подгрузка, то запоминаем сколько элементов осталось в базе
    this.databasePosition = position;

    // Верхний элемент-триггер для "ленивой" подгрузки
    if (this.databasePosition > 0) {
      this.upperMessageElement = this.messagesElement.querySelector('.chaos_messages_message:nth-child(3)');
    }
  }

  // "Ленивая" подгрузка
  lazyLoad() {
    if (this.databasePosition <= 0) return;
    if (this.upperMessageElement && this.upperMessageElement.getBoundingClientRect().bottom > 0) {
      this.upperMessageElement = '';
      this.request.send('load', this.databasePosition);
    }
  }

  // Показ выбранного сообщения
  showMessage(message) {
    const selectContainerElement = DOM.createSelectContainer(message.message, message.date);
    const selectCloseElement = selectContainerElement.querySelector('.chaos_select_close');
    this.parentElement.querySelector('.chaos_messages').replaceWith(selectContainerElement);
    selectCloseElement.addEventListener('click', this.closeMessage);
  }

  // Закрываем выбранное сообщение
  closeMessage() {
    this.parentElement.querySelector('.chaos_select_container').replaceWith(this.messagesElement);
    this.messagesElement.scrollTop = this.messagesElement.scrollHeight
    - this.messagesElement.getBoundingClientRect().height;
  }

  // Показываем форму прикрепления файлов
  showAddForm() {
    this.addFormElement.classList.toggle('chaos_add_container_visible');
  }

  // Отправка сообщений
  submitForm(event) {
    event.preventDefault();
    const inputValue = this.inputElement.value;
    if (!inputValue) {
      this.showError();
      return;
    }

    this.request.send('message', this.inputElement.value);
  }

  // Добавляем отправленное сообщение в конец
  addMessage(text, date) {
    const messageElement = DOM.createMessageElement(text, date);
    this.messagesElement.append(messageElement);

    this.messagesElement.scrollTop = this.messagesElement.scrollHeight
    - this.messagesElement.getBoundingClientRect().height;

    this.inputElement.value = '';
  }

  // Добавляем отправленный файл в конец
  addFile(type, fileName, date) {
    switch (type) {
      case 'image': {
        const messageElement = DOM.createImageElement(this.server, fileName, date);
        this.messagesElement.append(messageElement);
        break;
      }
      case 'video': {
        break;
      }
      default: {
        return;
      }
    }
    this.messagesElement.scrollTop = this.messagesElement.scrollHeight
    - this.messagesElement.getBoundingClientRect().height;
  }

  // Ошибка пустого сообщения
  showError() {
    this.inputElement.classList.add('chaos_form_invalid');
    this.inputElement.addEventListener('keydown', this.removeError);
  }

  // Отключаем ошибку пустого сообщения
  removeError() {
    this.inputElement.classList.remove('chaos_form_invalid');
    this.inputElement.removeEventListener('keydown', this.removeError);
  }

  // Ошибка соединения
  connectionError() {
    const connectionErrorElement = DOM.createErrorConnectionElement();
    this.parentElement.querySelector('.chaos_container').append(connectionErrorElement);
  }
}
