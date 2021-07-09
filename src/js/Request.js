export default class Request {
  constructor(server) {
    // Смена протокола сервера
    this.server = server;
    this.wsServer = this.server.replace(/^http/i, 'ws');

    // Первичное создание объектов
    this.data = { event: 'load' };
    this.callbacks = {
      error: () => { throw Error('Ошибка соединения'); },
    };

    // Привязываем контекст
    this.onOpen = this.onOpen.bind(this);
    this.onMessage = this.onMessage.bind(this);
  }

  init() {
    this.ws = new WebSocket(this.wsServer);

    // При соединении запрашиваем первичные данные
    this.ws.addEventListener('open', this.onOpen);

    this.ws.addEventListener('message', this.onMessage);

    this.ws.addEventListener('error', this.callbacks.error);
    this.ws.addEventListener('close', this.callbacks.error);
  }

  // Открытие соединения
  onOpen() {
    this.ws.send(JSON.stringify(this.data));
  }

  // Получение сообщения
  onMessage(event) {
    const data = JSON.parse(event.data);
    // Ответ с базой сообщений
    if (data.event === 'database') {
      this.callbacks.load(data.dB, data.favourites, data.position);
      if (data.pinnedMessage) {
        this.callbacks.pinMessage(data.pinnedMessage.type, data.pinnedMessage.id,
          data.pinnedMessage.message, data.pinnedMessage.geo, data.pinnedMessage.date);
      }
      this.callbacks.sideLoad(data.side);
    }
    // Успешная отправка текстового сообщения
    if (data.event === 'text') {
      this.callbacks.message(data.id, data.message, data.geo, data.date);
      this.callbacks.sideLoad(data.side);
    }
    // Успешная отправка файла
    if (data.event === 'file') {
      this.callbacks.file(data.type, data.id, data.message, data.geo, data.date);
      this.callbacks.sideLoad(data.side);
    }
    // Ответ с базой по категории хранилища
    if (data.event === 'storage') {
      this.callbacks.sideCategory(data);
    }
    // Ответ с выбранным из хранилища сообщением
    if (data.event === 'select') {
      this.callbacks.showMessage(data.message);
    }
    // Успешное удаление сообщения
    if (data.event === 'delete') {
      this.callbacks.delete(data.id);
      this.callbacks.sideLoad(data.side);
    }
    // Успешное добавление в избранное сообщения
    if (data.event === 'favourite') {
      this.callbacks.favourite(data.id);
      this.callbacks.sideLoad(data.side);
    }
    // Успешное удаление сообщения из избранного
    if (data.event === 'favouriteRemove') {
      this.callbacks.favouriteRemove(data.id);
      this.callbacks.sideLoad(data.side);
    }
    // Ответ с избранными сообщениями
    if (data.event === 'favouritesLoad') {
      this.callbacks.load(data.dB, data.favourites, 0);
      if (data.pinnedMessage) {
        this.callbacks.pinMessage(data.pinnedMessage.type, data.pinnedMessage.id,
          data.pinnedMessage.message, data.pinnedMessage.geo, data.pinnedMessage.date);
      }
      this.callbacks.sideFavourites(data.dB);
    }
    // Успешное добавление сообщения в закрепленное
    if (data.event === 'pin') {
      this.callbacks.pin(data.pinnedMessage.id);
      this.callbacks.pinMessage(data.pinnedMessage.type, data.pinnedMessage.id,
        data.pinnedMessage.message, data.pinnedMessage.geo, data.pinnedMessage.date);
    }
    // Успешное удаление сообщения из закрепленного
    if (data.event === 'unpin') {
      this.callbacks.unpin(data.id);
    }
  }

  // Отправка сообщения
  send(event, message) {
    if (this.ws.readyState === 1) {
      this.data = { event, message };
      this.ws.send(JSON.stringify(this.data));
    } else {
      this.callbacks.error();
    }
  }

  // Отправка файла
  sendFile(formData) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${this.server}/upload`);
    xhr.addEventListener('error', () => this.callbacks.error());
    xhr.send(formData);
  }
}
