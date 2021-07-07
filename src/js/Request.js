export default class Request {
  constructor(server) {
    this.server = server;
    this.wsServer = this.server.replace(/^http/i, 'ws');
    this.data = { event: 'load' };
    this.callbacks = {
      error: () => { throw Error('Ошибка соединения'); },
    };
  }

  init() {
    this.ws = new WebSocket(this.wsServer);

    // При соединении запрашиваем первичные данные
    this.ws.addEventListener('open', () => {
      this.ws.send(JSON.stringify(this.data));
    });

    this.ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      // Ответ с базой сообщений
      if (data.event === 'database') {
        this.callbacks.load(data.dB, data.favourites, data.position);
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
        this.callbacks.sideFavourites(data.dB);
      }
    });

    this.ws.addEventListener('error', this.callbacks.error);
    this.ws.addEventListener('close', this.callbacks.error);
  }

  send(event, message) {
    if (this.ws.readyState === 1) {
      this.data = { event, message };
      this.ws.send(JSON.stringify(this.data));
    } else {
      this.callbacks.error();
    }
  }

  sendFile(formData) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${this.server}/upload`);
    xhr.addEventListener('error', () => this.callbacks.error());
    xhr.send(formData);
  }
}
