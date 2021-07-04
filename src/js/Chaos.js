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
    this.addFileElement = this.addFormElement.querySelector('.chaos_add_files');
    this.messagesElement = this.parentElement.querySelector('.chaos_messages');
    this.messages = new Map();

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
    this.showSelectMessage = this.showSelectMessage.bind(this);
    this.closeSelectMessage = this.closeSelectMessage.bind(this);
    this.showMessageDot = this.showMessageDot.bind(this);
    this.removeMessageDot = this.removeMessageDot.bind(this);
    this.showMessageTools = this.showMessageTools.bind(this);
    this.closeMessageTools = this.closeMessageTools.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
    this.deleteMessageElement = this.deleteMessageElement.bind(this);
  }

  init() {
    // Соединяемся с WebSocket
    this.request.callbacks = {
      error: this.connectionError,
      load: this.renderMessages,
      message: this.addMessage,
      file: this.addFile,
      showMessage: this.showSelectMessage,
      delete: this.deleteMessageElement,
      sideLoad: this.sidePanel.render,
      sideCategory: this.sidePanel.showCategoryItems,
    };
    this.request.init();

    // Вешаем события
    this.messagesElement.addEventListener('scroll', this.lazyLoad);
    this.formElement.addEventListener('submit', this.submitForm);
    this.clipElement.addEventListener('click', this.showAddForm);
    this.addFileElement.addEventListener('click', this.fileLoader.openForm);
  }

  // Конструктор элемента сообщения в зависимости от типа
  buildMessageElement(type, id, message, date) {
    let messageElement = '';
    switch (type) {
      case 'text': {
        messageElement = DOM.createMessageElement(message, date);
        break;
      }
      case 'image': {
        messageElement = DOM.createImageElement(this.server, message, date);
        break;
      }
      case 'video': {
        messageElement = DOM.createVideoElement(this.server, message, date);
        break;
      }
      case 'audio': {
        messageElement = DOM.createAudioElement(this.server, message, date);
        break;
      }
      case 'file': {
        messageElement = DOM.createFileElement(this.server, message, date);
        break;
      }
      default: {
        break;
      }
    }

    this.messages.set(messageElement, id);
    messageElement.addEventListener('mouseenter', this.showMessageDot);
    messageElement.addEventListener('mouseleave', this.removeMessageDot);

    return messageElement;
  }

  // Отрисовка сообщений снизу вверх
  renderMessages(data, position) {
    console.log(data);
    for (const message of data) {
      const messageElement = this.buildMessageElement(
        message.type, message.id, message.message, message.date,
      );

      this.messagesElement.prepend(messageElement);

      // Если первичная загрузка, то проматываем вниз после загрузки содержимого
      if (!this.databasePosition) {
        this.scrollBottom(messageElement);
      }
    }
    // Если "ленивая" подгрузка, то записываем сколько элементов ещё можно подгрузить сверху
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

  // Показ выбранного (select) из хранилища сообщения
  showSelectMessage(message) {
    const messageElement = this.buildMessageElement(
      message.type, message.id, message.message, message.date,
    );
    const selectContainerElement = DOM.createSelectContainer(message.date);
    const selectCloseElement = selectContainerElement.querySelector('.chaos_select_close');
    selectContainerElement.append(messageElement);
    this.parentElement.querySelector('.chaos_messages').replaceWith(selectContainerElement);
    selectCloseElement.addEventListener('click', this.closeSelectMessage);
  }

  // Закрываем выбранное из хранилища сообщение
  closeSelectMessage() {
    this.parentElement.querySelector('.chaos_select_container').replaceWith(this.messagesElement);
    this.messagesElement.scrollTop = this.messagesElement.scrollHeight
    - this.messagesElement.getBoundingClientRect().height;
  }

  // Показываем форму прикрепления файлов
  showAddForm() {
    this.addFormElement.classList.toggle('chaos_add_container_visible');
    this.clipElement.classList.toggle('chaos_form_clip_active');
  }

  // Отправка текстовых сообщений
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
  addMessage(id, text, date) {
    const messageElement = this.buildMessageElement('text', id, text, date);
    messageElement.classList.add('chaos_messages_message_animation');
    this.messagesElement.append(messageElement);

    this.scrollBottom(messageElement);

    this.inputElement.value = '';
  }

  // Добавляем отправленный файл в конец
  addFile(type, id, fileName, date) {
    const messageElement = this.buildMessageElement(type, id, fileName, date);
    messageElement.classList.add('chaos_messages_message_animation');
    this.messagesElement.append(messageElement);

    this.scrollBottom(messageElement);
  }

  // Показать точку для открытия дополнительного меню сообщения
  showMessageDot(event) {
    const dotElement = event.target.querySelector('.chaos_message_tools');
    dotElement.classList.toggle('chaos_message_tools_show');
    dotElement.addEventListener('click', this.showMessageTools);
  }

  // Скрыть точку для открытия дополнительного меню сообщения
  removeMessageDot(event) {
    const dotElement = event.target.querySelector('.chaos_message_tools');
    dotElement.classList.toggle('chaos_message_tools_show');
    dotElement.classList.remove('chaos_message_tools_active');
    const toolsElement = event.target.querySelector('.chaos_message_tools_container');
    if (toolsElement) {
      dotElement.removeEventListener('click', this.closeMessageTools);
      toolsElement.remove();
    }
  }

  // Показать дополнительное меню сообщения
  showMessageTools(event) {
    const dotElement = event.target;
    dotElement.classList.add('chaos_message_tools_active');
    dotElement.removeEventListener('click', this.showMessageTools);
    dotElement.addEventListener('click', this.closeMessageTools);
    const toolsElement = DOM.createToolsElements();
    dotElement.after(toolsElement);

    const deleteElement = toolsElement.querySelector('.chaos_message_tools_delete');
    // const pinElement = toolsElement.querySelector('.chaos_message_tools_pin');
    // const favouriteElement = toolsElement.querySelector('.chaos_message_tools_favourite');
    deleteElement.addEventListener('click', this.deleteMessage);
    // pinElement.addEventListener('click', this.pinMessage);
    // favouriteElement.addEventListener('click', this.addTofavourite);
  }

  // Скрыть дополнительное меню сообщения
  closeMessageTools(event) {
    const dotElement = event.target;
    const toolsElement = dotElement.closest('.chaos_message_header').querySelector('.chaos_message_tools_container');
    toolsElement.remove();
    dotElement.classList.toggle('chaos_message_tools_active');
    dotElement.removeEventListener('click', this.closeMessageTools);
    dotElement.addEventListener('click', this.showMessageTools);
  }

  // Запрос на удаление сообщения
  deleteMessage(event) {
    const messageId = this.messages.get(event.target.closest('.chaos_messages_message'));
    this.request.send('delete', messageId);
  }

  // Удаление элемента сообщения из ленты
  deleteMessageElement(messageId) {
    const ifSelectedMessage = this.parentElement.querySelector('.chaos_select_container');
    if (ifSelectedMessage) {
      this.closeSelectMessage();
      this.sidePanel.closeCategory();
    }

    const messagesElement = [...this.messages.entries()]
      .filter(({ 1: id }) => id === messageId).map(([key]) => key);

    messagesElement.forEach((item) => {
      this.messages.delete(item);
      item.remove();
    });
  }

  // Прокрутка сообщений вниз по загрузке их содержимого
  scrollBottom(messageElement) {
    // Если содержимое - медийный элемент
    let checkLoad = messageElement.querySelectorAll('.chaos_message_body video, .chaos_message_body audio');
    [...checkLoad].forEach((element) => {
      element.addEventListener('loadeddata', () => {
        this.messagesElement.scrollTop = this.messagesElement.scrollHeight
            - this.messagesElement.getBoundingClientRect().height;
      });
    });
    // Если картинка
    checkLoad = messageElement.querySelectorAll('.chaos_message_body img');
    [...checkLoad].forEach((element) => {
      element.addEventListener('load', () => {
        this.messagesElement.scrollTop = this.messagesElement.scrollHeight
            - this.messagesElement.getBoundingClientRect().height;
      });
    });
    // Или если текст
    this.messagesElement.scrollTop = this.messagesElement.scrollHeight
            - this.messagesElement.getBoundingClientRect().height;
  }

  // Ошибка отправки пустого сообщения
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
