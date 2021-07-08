import Request from './Request';
import DOM from './DOM';
import SidePanel from './SidePanel';
import FileLoader from './FileLoader';
import MediaLoader from './MediaLoader';
import Geolocation from './Geolocation';

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
    this.addAudioElement = this.addFormElement.querySelector('.chaos_add_audio');
    this.addVideoElement = this.addFormElement.querySelector('.chaos_add_video');
    this.addGeoElement = this.addFormElement.querySelector('.chaos_add_geo');
    this.messagesElement = this.parentElement.querySelector('.chaos_messages');
    this.messages = new Map();

    // Заводим вспомогательные классы
    this.request = new Request(this.server);
    this.sidePanel = new SidePanel(this.parentElement.querySelector('aside.chaos_side'), this, this.request);
    this.geolocation = new Geolocation(this.parentElement);
    this.fileLoader = new FileLoader(this.parentElement, this.geolocation, this.request);
    this.mediaLoader = new MediaLoader(this.parentElement, this.geolocation, this.request);

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
    this.addToFavourites = this.addToFavourites.bind(this);
    this.removeFromFavourites = this.removeFromFavourites.bind(this);
    this.showFavouriteMark = this.showFavouriteMark.bind(this);
    this.removeFavouriteMark = this.removeFavouriteMark.bind(this);
    this.pinMessage = this.pinMessage.bind(this);
    this.unpinMessage = this.unpinMessage.bind(this);
    this.markPinnedMessage = this.markPinnedMessage.bind(this);
    this.unmarkPinnedMessage = this.unmarkPinnedMessage.bind(this);
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
      favourite: this.showFavouriteMark,
      favouriteRemove: this.removeFavouriteMark,
      sideLoad: this.sidePanel.render,
      sideCategory: this.sidePanel.showCategoryItems,
      sideFavourites: this.sidePanel.showFavouritesDescription,
      pin: this.markPinnedMessage,
      unpin: this.unmarkPinnedMessage,
    };
    this.request.init();

    // Вешаем события
    this.messagesElement.addEventListener('scroll', this.lazyLoad);
    this.formElement.addEventListener('submit', this.submitForm);
    this.clipElement.addEventListener('click', this.showAddForm);
    this.addFileElement.addEventListener('click', this.fileLoader.openForm);
    this.addAudioElement.addEventListener('click', this.mediaLoader.openMedia);
    this.addVideoElement.addEventListener('click', this.mediaLoader.openMedia);
    this.addGeoElement.addEventListener('click', this.geolocation.attachGeo);
  }

  // Конструктор элемента сообщения в зависимости от типа
  buildMessageElement(type, id, message, geo, date) {
    let messageElement = '';
    switch (type) {
      case 'text': {
        messageElement = DOM.createMessageElement(message, geo, date);
        break;
      }
      case 'image': {
        messageElement = DOM.createImageElement(this.server, message, geo, date);
        break;
      }
      case 'video': {
        messageElement = DOM.createVideoElement(this.server, message, geo, date);
        break;
      }
      case 'audio': {
        messageElement = DOM.createAudioElement(this.server, message, geo, date);
        break;
      }
      case 'file': {
        messageElement = DOM.createFileElement(this.server, message, geo, date);
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
  renderMessages(data, favourites, pinnedMessage, position) {
    console.log(data);
    if (pinnedMessage) {
      const messageElement = this.buildMessageElement(
        pinnedMessage.type, pinnedMessage.id, pinnedMessage.message,
        pinnedMessage.geo, pinnedMessage.date,
      );
      this.showPinnedMessage(messageElement);
      this.pinnedMessage = pinnedMessage.id;
    }

    for (const message of data) {
      const messageElement = this.buildMessageElement(
        message.type, message.id, message.message, message.geo, message.date,
      );

      if (favourites.indexOf(message.id) !== -1) {
        this.showFavouriteMark(message.id);
      }

      if (message.pinned) {
        this.markPinnedMessage(message.id);
      }

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
      message.type, message.id, message.message, message.geo, message.date,
    );
    const selectContainerElement = DOM.createSelectContainer(message.date);
    const selectCloseElement = selectContainerElement.querySelector('.chaos_select_close');
    selectContainerElement.append(messageElement);
    this.parentElement.querySelector('.chaos_messages').replaceWith(selectContainerElement);
    selectCloseElement.addEventListener('click', this.closeSelectMessage);
  }

  // Закрываем выбранное из хранилища сообщение
  closeSelectMessage() {
    const ifSelectedMessage = this.parentElement.querySelector('.chaos_select_container');
    if (!ifSelectedMessage) {
      return;
    }

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

    this.request.send('message', { text: this.inputElement.value, geo: this.geolocation.coords });
  }

  // Добавляем отправленное сообщение в конец
  addMessage(id, text, geo, date) {
    const messageElement = this.buildMessageElement('text', id, text, geo, date);
    messageElement.classList.add('chaos_messages_message_animation');
    this.messagesElement.append(messageElement);

    this.scrollBottom(messageElement);

    this.inputElement.value = '';
    this.geolocation.removeCoords();
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
    dotElement.classList.add('chaos_message_tools_show');
    dotElement.addEventListener('click', this.showMessageTools);
  }

  // Скрыть точку для открытия дополнительного меню сообщения
  removeMessageDot(event) {
    const dotElement = event.target.querySelector('.chaos_message_tools');
    dotElement.classList.remove('chaos_message_tools_show');
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
    const pinElement = toolsElement.querySelector('.chaos_message_tools_pin');
    const favouriteElement = toolsElement.querySelector('.chaos_message_tools_favourite');
    deleteElement.addEventListener('click', this.deleteMessage);
    pinElement.addEventListener('click', this.pinMessage);
    favouriteElement.addEventListener('click', this.addToFavourites);
  }

  // Скрыть дополнительное меню сообщения
  closeMessageTools(event) {
    const dotElement = event.target;
    const toolsElement = dotElement.closest('.chaos_message_header').querySelector('.chaos_message_tools_container');
    if (toolsElement) {
      toolsElement.remove();
    }
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

  // Запрос на добавление в избранное
  addToFavourites(event) {
    const messageId = this.messages.get(event.target.closest('.chaos_messages_message'));

    const isFavouriteMark = event.target.closest('.chaos_messages_message').querySelector('.chaos_message_favourite');
    if (isFavouriteMark) {
      return;
    }

    this.request.send('favourite', messageId);
    this.closeMessageTools(event);
  }

  // Запрос на удаление из избранного
  removeFromFavourites(event) {
    const messageId = this.messages.get(event.target.closest('.chaos_messages_message'));
    this.request.send('favouriteRemove', messageId);
  }

  // Добавляем метку избранного на сообщение
  showFavouriteMark(messageId) {
    const messageElement = [...this.messages.entries()]
      .filter(({ 1: id }) => id === messageId).map(([key]) => key);

    const favouriteElement = DOM.getFavouriteMark();
    messageElement[0].querySelector('.chaos_message_header').prepend(favouriteElement);
    favouriteElement.addEventListener('click', this.removeFromFavourites);
  }

  // Удаляем метку избранного с сообщения
  removeFavouriteMark(messageId) {
    const messageElement = [...this.messages.entries()]
      .filter(({ 1: id }) => id === messageId).map(([key]) => key);
    messageElement[0].querySelector('.chaos_message_favourite').remove();
  }

  // Запрос на закрепление сообщения
  pinMessage(event) {
    const messageId = this.messages.get(event.target.closest('.chaos_messages_message'));

    const isPinned = event.target.closest('.chaos_messages_message').querySelector('.chaos_message_pin');
    if (isPinned) {
      return;
    }

    this.request.send('pin', messageId);
    this.closeMessageTools(event);
  }

  // Запрос на снятие сообщения из закрепленного
  unpinMessage() {
    this.request.send('unpin', this.pinnedMessage);
  }

  // Добавляем метку закреплённого сообщения
  markPinnedMessage(messageId) {
    const lastPinnedMessage = this.messagesElement.querySelector('.chaos_message_pin');
    if (lastPinnedMessage) {
      lastPinnedMessage.remove();
      this.parentElement.querySelector('.chaos_pinned').remove();
    }
    this.pinnedMessage = messageId;

    const messageElement = [...this.messages.entries()]
      .filter(({ 1: id }) => id === messageId).map(([key]) => key);

    const pinMarkElement = DOM.getPinMark();
    messageElement[0].querySelector('.chaos_message_header').prepend(pinMarkElement);
    pinMarkElement.addEventListener('click', this.unpinMessage);
    this.showPinnedMessage(messageElement[0]);
  }

  // Удаляем метку закреплённого с сообщения
  unmarkPinnedMessage(messageId) {
    this.pinnedMessage = '';
    const messageElement = [...this.messages.entries()]
      .filter(({ 1: id }) => id === messageId).map(([key]) => key);
    messageElement[0].querySelector('.chaos_message_pin').remove();
    this.parentElement.querySelector('.chaos_pinned').remove();
  }

  // Прикрепляем плашку с закреплённым сообщением
  showPinnedMessage(messageElement) {
    const hasPinnedMessage = this.messagesElement.querySelector('.chaos_pinned');
    if (hasPinnedMessage) {
      hasPinnedMessage.remove();
    }

    const pinnedElement = DOM.getPinnedMessage(messageElement.querySelector('.chaos_message_body'));
    this.messagesElement.append(pinnedElement);
    const closeElement = pinnedElement.querySelector('.chaos_pinned_close');
    closeElement.addEventListener('click', this.unpinMessage);
    const selectElement = pinnedElement.querySelector('.chaos_pinned_select');
    selectElement.addEventListener('click', () => this.request.send('select', this.pinnedMessage));
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
