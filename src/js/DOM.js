export default class DOM {
  // Создаём элемент сообщения ленты
  static createMessageElement(text, date) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chaos_messages_message');
    const messageTextElement = document.createElement('div');
    messageTextElement.classList.add('chaos_message_body');
    messageTextElement.innerHTML = this.linkify(text);
    const messageDateElement = document.createElement('div');
    messageDateElement.classList.add('chaos_message_date');
    const dateFormat = new Intl.DateTimeFormat('ru', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    messageDateElement.innerText = dateFormat.format(date);
    messageElement.append(messageTextElement, messageDateElement);
    return messageElement;
  }

  // Создаём элемент сообщения с изображением в ленту
  static createImageElement(url, fileName, date) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chaos_messages_message');
    const imageElement = document.createElement('img');
    imageElement.src = `${url}/${fileName}`;
    imageElement.classList.add('chaos_messages_image');
    const messageTextElement = document.createElement('div');
    messageTextElement.classList.add('chaos_message_body');
    const messageDateElement = document.createElement('div');
    messageDateElement.classList.add('chaos_message_date');
    const dateFormat = new Intl.DateTimeFormat('ru', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    messageDateElement.innerText = dateFormat.format(date);
    messageTextElement.append(imageElement);
    messageElement.append(messageTextElement, messageDateElement);
    return messageElement;
  }

  // Создаём контейнер выбранного сообщения
  static createSelectContainer(text, date) {
    const selectContainerElement = document.createElement('div');
    selectContainerElement.classList.add('chaos_messages', 'chaos_select_container');
    const selectHeaderElement = document.createElement('div');
    selectHeaderElement.classList.add('chaos_select_header');
    const dateFormat = new Intl.DateTimeFormat('ru', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    selectHeaderElement.innerText = `Сообщение от ${dateFormat.format(date)}`;
    const selectCloseElement = document.createElement('div');
    selectCloseElement.classList.add('chaos_select_close');
    const selectMessageContainerElement = document.createElement('div');
    selectMessageContainerElement.classList.add('chaos_messages_message');
    const selectMessageElement = document.createElement('div');
    selectMessageElement.classList.add('chaos_message_body');
    selectMessageElement.innerHTML = this.linkify(text);
    selectHeaderElement.append(selectCloseElement);
    selectMessageContainerElement.append(selectMessageElement);
    selectContainerElement.append(selectHeaderElement, selectMessageContainerElement);
    return selectContainerElement;
  }

  // Создаём элемент заглушки ошибки соединения
  static createErrorConnectionElement() {
    const connectionErrorElement = document.createElement('div');
    connectionErrorElement.classList.add('chaos_connection_error');
    return connectionErrorElement;
  }

  // Создаём элементы категорий хранилища
  static createSideElement(className, text, count) {
    const sideElement = document.createElement('li');
    sideElement.classList.add('chaos_side_item', className);
    sideElement.innerText = `${text}: `;
    const countElement = document.createElement('span');
    countElement.innerText = count;
    sideElement.append(countElement);
    return sideElement;
  }

  // Создаём заголовок открытой категории
  static createSideSubheadElement(text) {
    const subheadElement = document.createElement('div');
    subheadElement.classList.add('chaos_side_subhead');
    const h3Element = document.createElement('h3');
    h3Element.innerText = text;
    const closeElement = document.createElement('div');
    closeElement.classList.add('chaos_side_close');
    subheadElement.append(h3Element, closeElement);
    return subheadElement;
  }

  // Создаём список открытой категории
  static createSideCategoryList() {
    const categoryListElement = document.createElement('ul');
    categoryListElement.classList.add('chaos_side_list');
    return categoryListElement;
  }

  // Создаём элементы открытой категории ссылок
  static createSideLinksElement(link) {
    const linkElement = document.createElement('li');
    linkElement.classList.add('chaos_side_item', 'chaos_side_select');
    linkElement.innerHTML = `<a href="${link}">${link}</a>`;
    return linkElement;
  }

  // Создаём форму для отправки файла
  static getAddForm() {
    const addFormElement = document.createElement('label');
    addFormElement.classList.add('chaos_file_label');
    addFormElement.innerHTML = `
      <div class="chaos_file_input">Кликни или Кинь</div>
      <input type="file" class="chaos_file_hidden" accept="image/jpeg,image/png,image/gif,image/heic,image/heif,image/webp">`;
    return addFormElement;
  }

  // // Создаём кнопку отправки файла
  // static getAddButton() {
  //   const sendButtonContainerElement = document.createElement('div');
  //   sendButtonContainerElement.classList.add('chaos_file_button_container');
  //   const sendButtonElement = document.createElement('button');
  //   sendButtonElement.classList.add('chaos_file_button');
  //   sendButtonElement.type = 'button';
  //   sendButtonContainerElement.append(sendButtonElement);
  //   return sendButtonContainerElement;
  // }

  // Создаём область сброса файла для Drag and Drop
  static createDropPlace() {
    const dropplaceContainerElement = document.createElement('div');
    dropplaceContainerElement.classList.add('chaos_dropplace_container');
    const dropplaceElement = document.createElement('div');
    dropplaceElement.classList.add('chaos_dropplace');
    dropplaceContainerElement.append(dropplaceElement);
    return dropplaceContainerElement;
  }

  // Делаем все ссылки в сообщении кликабельными
  static linkify(text) {
    const textWithLinks = text.replace(/((http:\/\/|https:\/\/){1}(www)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-?%#&-]*)*\/?)/gi, '<a href="$1">$1</a>');
    return textWithLinks;
  }
}
