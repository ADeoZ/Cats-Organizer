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
        this.callbacks.load(data.dB, data.position);
        this.callbacks.sideLoad(data.side);
      }
      // Успешная отправка текстового сообщения
      if (data.event === 'text') {
        this.callbacks.message(data.message, data.date);
        this.callbacks.sideLoad(data.side);
      }
      // Успешная отправка файла
      if (data.event === 'file') {
        this.callbacks.file(data.type, data.message, data.date);
        this.callbacks.sideLoad(data.side);
      }
      // Ответ с базой по категории хранилища
      if (data.event === 'storage') {
        this.callbacks.sideCategory(data);
      }
      // Ответ с запрошенным сообщением
      if (data.event === 'select') {
        this.callbacks.showMessage(data.message);
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
    xhr.send(formData);
  }
}
