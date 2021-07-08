export default class DOM {
  // Основной шаблон для всех сообщений в ленту
  static createMessageContainer(bodyElement, geo, date) {
    const dateFormat = new Intl.DateTimeFormat('ru', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const messageElement = document.createElement('div');
    messageElement.classList.add('chaos_messages_message');
    messageElement.innerHTML = `
      <div class="chaos_message_header">
        <div class="chaos_message_tools"></div>
      </div>
      <div class="chaos_message_body">
      </div>
      <div class="chaos_message_date">
        ${dateFormat.format(date)}
      </div>
    `;

    const messageBodyElement = messageElement.querySelector('.chaos_message_body');
    messageBodyElement.append(bodyElement);

    if (geo) {
      const geoElement = document.createElement('div');
      geoElement.classList.add('chaos_message_geo');
      geoElement.innerHTML = `
        <div class="chaos_geo_icon"></div>
        <a href="https://yandex.ru/maps/?text=${geo}" target="_blank">[${geo}]</a>
      `;
      messageBodyElement.after(geoElement);
    }

    return messageElement;
  }

  // Элементы управления для сообщения (удалить, закрепить, избранное)
  static createToolsElements() {
    const toolsElements = document.createElement('div');
    toolsElements.classList.add('chaos_message_tools_container');
    toolsElements.innerHTML = `
      <div class="chaos_message_tools_delete"></div>
      <div class="chaos_message_tools_pin"></div>
      <div class="chaos_message_tools_favourite"></div>
    `;
    return toolsElements;
  }

  // Элемент с меткой для избранного сообщения
  static getFavouriteMark() {
    const favouriteElement = document.createElement('div');
    favouriteElement.classList.add('chaos_message_favourite');
    return favouriteElement;
  }

  // Элемент с меткой для избранного сообщения
  static getPinMark() {
    const pinMarkElement = document.createElement('div');
    pinMarkElement.classList.add('chaos_message_pin');
    return pinMarkElement;
  }

  // Плашка закреплённого сообщения
  static getPinnedMessage(element) {
    const pinnedElement = document.createElement('div');
    pinnedElement.classList.add('chaos_pinned');
    pinnedElement.innerHTML = `
      <div class="chaos_pinned_container">
        ${element.innerHTML}
      </div>
      <div class="chaos_pinned_side">
        <div class="chaos_pinned_title">Закреплённое сообщение <div class="chaos_pinned_close"></div></div>
        <div class="chaos_pinned_select"></div>
      </div>
    `;
    // pinnedElement.append(element.cloneNode(true));
    return pinnedElement;
  }

  // Элемент текстового сообщения ленты
  static createMessageElement(text, geo, date) {
    const textElement = document.createElement('p');
    textElement.innerHTML = this.linkify(text);
    return DOM.createMessageContainer(textElement, geo, date);
  }

  // Элемент сообщения с изображением в ленту
  static createImageElement(url, fileName, geo, date) {
    const imageElement = document.createElement('img');
    imageElement.src = `${url}/${fileName}`;
    imageElement.classList.add('chaos_messages_image');
    return DOM.createMessageContainer(imageElement, geo, date);
  }

  // Элемент сообщения с видео в ленту
  static createVideoElement(url, fileName, geo, date) {
    const videoElement = document.createElement('video');
    videoElement.src = `${url}/${fileName}`;
    videoElement.controls = true;
    videoElement.classList.add('chaos_messages_video');
    return DOM.createMessageContainer(videoElement, geo, date);
  }

  // Элемент сообщения с аудио в ленту
  static createAudioElement(url, fileName, geo, date) {
    const audioElement = document.createElement('audio');
    audioElement.src = `${url}/${fileName}`;
    audioElement.controls = true;
    audioElement.classList.add('chaos_messages_audio');
    return DOM.createMessageContainer(audioElement, geo, date);
  }

  // Элемент сообщения с произвольным файлом в ленту
  static createFileElement(url, fileName, geo, date) {
    const fileElement = document.createElement('div');
    fileElement.classList.add('chaos_messages_file');
    const fileLinkElement = document.createElement('a');
    fileLinkElement.href = `${url}/${fileName}`;
    const fileImageElement = document.createElement('div');
    fileImageElement.classList.add('chaos_messages_file_bg');
    fileLinkElement.append(fileImageElement);
    const fileLinkTextElement = fileLinkElement.cloneNode(false);
    fileLinkTextElement.innerText = fileName;
    fileElement.append(fileLinkElement, fileLinkTextElement);
    return DOM.createMessageContainer(fileElement, geo, date);
  }

  // Контейнер выбранного (selected) из хранилища сообщения
  static createSelectContainer(date) {
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
    selectHeaderElement.append(selectCloseElement);
    selectContainerElement.append(selectHeaderElement);
    return selectContainerElement;
  }

  // Элемент отображения ошибки соединения
  static createErrorConnectionElement() {
    const connectionErrorElement = document.createElement('div');
    connectionErrorElement.classList.add('chaos_connection_error');
    return connectionErrorElement;
  }

  // Элементы категорий хранилища
  static createSideElement(className, text, count) {
    const sideElement = document.createElement('li');
    sideElement.classList.add('chaos_side_item', className);
    sideElement.innerText = `${text}: `;
    const countElement = document.createElement('span');
    countElement.innerText = count;
    sideElement.append(countElement);
    return sideElement;
  }

  // Заголовок открытой категории хранилища
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

  // Список для элементов открытой категории хранилища
  static createSideCategoryList() {
    const categoryListElement = document.createElement('ul');
    categoryListElement.classList.add('chaos_side_list');
    return categoryListElement;
  }

  // Основной шаблон для всех элементов открытой категории
  static createSideElementContainer(bodyElement) {
    const listElement = document.createElement('li');
    listElement.classList.add('chaos_side_item', 'chaos_side_open_item');
    listElement.innerHTML = `
      <div class="chaos_side_open_container">
        <div class="chaos_side_open_select"></div>
        <div class="chaos_side_open_element">
        </div>
      </div>
    `;
    listElement.querySelector('.chaos_side_open_element').append(bodyElement);
    return listElement;
  }

  // Элементы открытой категории ссылок
  static createSideLinkElement(link) {
    const bodyElement = document.createElement('p');
    bodyElement.innerHTML = `<a href="${link}">${link}</a>`;
    const listElement = DOM.createSideElementContainer(bodyElement);
    return listElement;
  }

  // Элементы открытой категории изображений
  static createSideImageElement(fileName, url) {
    const bodyElement = document.createElement('img');
    bodyElement.src = `${url}/${fileName}`;
    bodyElement.classList.add('chaos_messages_image');
    const listElement = DOM.createSideElementContainer(bodyElement);
    return listElement;
  }

  // Элементы открытой категории видео
  static createSideVideoElement(fileName, url) {
    const bodyElement = document.createElement('video');
    bodyElement.src = `${url}/${fileName}`;
    bodyElement.classList.add('chaos_messages_video');
    bodyElement.controls = true;
    const listElement = DOM.createSideElementContainer(bodyElement);
    return listElement;
  }

  // Элементы открытой категории аудио
  static createSideAudioElement(fileName, url) {
    const bodyElement = document.createElement('audio');
    bodyElement.src = `${url}/${fileName}`;
    bodyElement.classList.add('chaos_messages_audio');
    bodyElement.controls = true;
    const listElement = DOM.createSideElementContainer(bodyElement);
    return listElement;
  }

  // Элементы открытой категории файлов
  static createSideFileElement(fileName, url) {
    const bodyElement = document.createElement('p');
    bodyElement.innerHTML = `<a href="${url}/${fileName}">${fileName}</a>`;
    const listElement = DOM.createSideElementContainer(bodyElement);
    return listElement;
  }

  // Элемент описание категории избранного
  static createFavouritesDescription(count, dateFrom, dateTo) {
    const dateFormat = new Intl.DateTimeFormat('ru', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const listElement = document.createElement('li');
    listElement.classList.add('chaos_side_item', 'chaos_side_open_item');
    listElement.innerHTML = `
      <div class="chaos_side_open_container">
        <div class="chaos_side_open_element">
          <p class="chaos_side_favourites_description">Всего сообщений: <b>${count}</b><br>
          С <b>${dateFormat.format(dateFrom)}</b><br>
          По <b>${dateFormat.format(dateTo)}</b></p>
        </div>
      </div>
    `;
    return listElement;
  }

  // Форма для отправки файла
  static getAddForm() {
    const addFormElement = document.createElement('label');
    addFormElement.classList.add('chaos_file_label');
    addFormElement.innerHTML = `
      <div class="chaos_file_input">Кликни или Кинь</div>
      <input type="file" class="chaos_file_hidden">`;
    return addFormElement;
  }

  // Форма для записи медиа (аудио/видео)
  static getMediaForm(type) {
    const mediaContainerElement = document.createElement('div');
    mediaContainerElement.classList.add('chaos_media_container');
    const mediaRecordElement = document.createElement('div');
    mediaRecordElement.classList.add('chaos_media_record');
    const mediaStatusElement = document.createElement('div');
    mediaStatusElement.classList.add('chaos_media_status');
    mediaStatusElement.innerText = `Ожидание ${type}`;
    const mediaStopElement = document.createElement('div');
    mediaStopElement.classList.add('chaos_media_stop');
    mediaContainerElement.append(mediaRecordElement, mediaStatusElement, mediaStopElement);
    return mediaContainerElement;
  }

  // Элемент с географическими координатами
  static createGeoElement(value) {
    const geoElement = document.createElement('div');
    geoElement.classList.add('chaos_geo');
    geoElement.innerHTML = `
      <div class="chaos_geo_icon"></div>
      [${value}]
      <div class="chaos_geo_close"></div>
      `;
    return geoElement;
  }

  // Ошибка недоступности записи медиа
  static errorMediaForm() {
    const mediaContainerElement = document.createElement('div');
    mediaContainerElement.classList.add('chaos_media_container');
    const mediaStatusElement = document.createElement('div');
    mediaStatusElement.classList.add('chaos_media_status');
    mediaStatusElement.innerText = 'Ваш браузер не поддерживает запись медиа';
    mediaContainerElement.append(mediaStatusElement);
    return mediaContainerElement;
  }

  // Элемент для закрытия формы
  static getCloseForm() {
    const closeElement = document.createElement('div');
    closeElement.classList.add('chaos_form_close');
    return closeElement;
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

  // Область сброса файла для Drag and Drop
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
