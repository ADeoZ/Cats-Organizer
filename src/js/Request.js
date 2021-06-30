export default class Request {
  constructor(server) {
    this.server = `http://${server}`;
    this.wsServer = `ws://${server}`;
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
      if (data.type === 'database') {
        this.callbacks.load(data.dB, data.position);
        this.callbacks.sideLoad(data.side);
      }
      // Успешная отправка текстового сообщения
      if (data.type === 'text') {
        this.callbacks.message(data.message, data.date);
        this.callbacks.sideLoad(data.side);
      }
      // Успешная отправка файла
      if (data.type === 'file') {
        console.log(data.link);
        const img = document.createElement('img');
        img.src = `${this.server}/${data.link}`;
        document.querySelector('.chaos_messages').append(img);
      }
      // Ответ с базой по категории хранилища
      if (data.type === 'storage') {
        this.callbacks.sideCategory(data);
      }
      // Ответ с запрошенным сообщением
      if (data.type === 'select') {
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
    xhr.open('POST', this.server);
    xhr.send(formData);
  }
}
